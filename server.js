require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const paypal = require('@paypal/checkout-server-sdk');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PRODUCT_ID_ALIASES = {
  'Intel Core i5-12400F': 1,
  'Intel Core i7-12700K': 2,
  'AMD Ryzen 5 5600X': 3,
  'AMD Ryzen 7 5800X3D': 4,
  'Intel Core i9-12900K': 5,
  'AMD Ryzen 9 5900X': 6,
  'NVIDIA RTX 4060': 7,
  'NVIDIA RTX 4070': 8,
  'AMD RX 7600': 9,
  'NVIDIA RTX 4080': 10,
  'AMD RX 7800 XT': 11,
  'NVIDIA RTX 4090': 12,
  'MSI B450 TOMAHAWK MAX': 13,
  'ASUS ROG STRIX B550-F': 14,
  'MSI MAG Z690 TOMAHAWK': 15,
  'ASUS ROG CROSSHAIR X570': 16,
  'Gigabyte Z790 AORUS ELITE': 17,
  'ASRock B650M PRO RS': 18,
  'Corsair Vengeance LPX 8GB DDR4': 19,
  'G.Skill Ripjaws V 16GB DDR4': 20,
  'Kingston HyperX Fury 32GB DDR4': 21,
  'Corsair Vengeance 16GB DDR5': 22,
  'TeamGroup T-Force Delta RGB 32GB DDR5': 23,
  'G.Skill Trident Z RGB 64GB DDR4': 24,
  'Samsung 870 EVO 500GB SATA SSD': 25,
  'WD Blue SN570 1TB NVMe SSD': 26,
  'Seagate Barracuda 2TB HDD': 27,
  'Crucial P5 Plus 1TB NVMe SSD': 28,
  'WD Blue 4TB HDD': 29,
  'Kingston NV2 2TB NVMe SSD': 30,
  'Corsair CV450 450W 80+ Bronze': 31,
  'Seasonic S12III 650W 80+ Bronze': 32,
  'Corsair RM750x 750W 80+ Gold': 33,
  'EVGA SuperNOVA 850W 80+ Gold': 34,
  'Seasonic Prime TX-1000 1000W 80+ Titanium': 35,
  'Cooler Master MWE 600W 80+ Bronze': 36,
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
let db;
async function connectDB() {
  try {
    db = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecom_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    await db.query('SELECT 1');
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// PayPal configuration
let paypalEnvironment;
let paypalClient;

function setupPayPal() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === 'your_paypal_client_id' || clientSecret === 'your_paypal_client_secret') {
    console.warn('PayPal credentials are missing or still set to placeholders. Checkout will stay unavailable until they are configured.');
    paypalEnvironment = null;
    paypalClient = null;
    return;
  }

  const environment = process.env.PAYPAL_ENVIRONMENT === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);

  paypalEnvironment = environment;
  paypalClient = new paypal.core.PayPalHttpClient(environment);
}

// API Routes

app.get('/api/config/paypal', (req, res) => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const configured = Boolean(clientId && clientId !== 'your_paypal_client_id');

  res.json({
    clientId: configured ? clientId : null,
    currency: 'USD',
    configured
  });
});

// GET /api/products - Fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM products WHERE in_stock = true');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/orders - Create a new order
app.post('/api/orders', async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    street_address,
    city,
    state,
    zip_code,
    items,
    total_amount
  } = req.body;

  if (!first_name || !last_name || !email || !street_address || !city || !state || !zip_code || !items || !total_amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must include at least one item' });
  }

  if (!paypalClient) {
    return res.status(503).json({ error: 'PayPal is not configured on the server' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Insert order
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (first_name, last_name, email, street_address, city, state, zip_code, total_amount, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [first_name, last_name, email, street_address, city, state, zip_code, total_amount]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      const productId = await resolveProductId(connection, item);

      if (!productId) {
        throw new Error(`Could not resolve product for order item: ${item.title || item.product_id}`);
      }

      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, productId, item.quantity, item.price]
      );
    }

    await connection.commit();

    // Create PayPal order
    const paypalOrder = await createPayPalOrder(orderId, total_amount);
    res.json({ orderId, paypalOrderId: paypalOrder.id });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    connection.release();
  }
});

// POST /api/orders/:id/capture - Capture PayPal payment
app.post('/api/orders/:id/capture', async (req, res) => {
  const orderId = req.params.id;
  const { paypalOrderId } = req.body;

  try {
    // Capture PayPal payment
    const captureResult = await capturePayPalOrder(paypalOrderId);

    // Update order status
    await db.execute(
      `UPDATE orders SET payment_status = 'Completed', payment_id = ? WHERE id = ?`,
      [captureResult.id, orderId]
    );

    res.json({ success: true, captureId: captureResult.id });
  } catch (error) {
    console.error('Error capturing payment:', error);
    res.status(500).json({ error: 'Failed to capture payment' });
  }
});

// PayPal helper functions
async function resolveProductId(connection, item) {
  if (Number.isInteger(item.product_id) && item.product_id > 0) {
    return item.product_id;
  }

  if (!item.title) {
    return null;
  }

  if (PRODUCT_ID_ALIASES[item.title]) {
    return PRODUCT_ID_ALIASES[item.title];
  }

  const [rows] = await connection.execute(
    'SELECT id FROM products WHERE name = ? LIMIT 1',
    [item.title]
  );

  return rows[0]?.id ?? null;
}

async function createPayPalOrder(orderId, totalAmount) {
  if (!paypalClient) {
    throw new Error('PayPal client is not configured');
  }

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: orderId.toString(),
      amount: {
        currency_code: 'USD',
        value: totalAmount.toFixed(2)
      }
    }],
    application_context: {
      return_url: `${FRONTEND_URL}/success`,
      cancel_url: `${FRONTEND_URL}/cancel`
    }
  });

  const order = await paypalClient.execute(request);
  return order.result;
}

async function capturePayPalOrder(orderId) {
  if (!paypalClient) {
    throw new Error('PayPal client is not configured');
  }

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});
  const capture = await paypalClient.execute(request);
  return capture.result;
}

// Start server
async function startServer() {
  await connectDB();
  setupPayPal();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
