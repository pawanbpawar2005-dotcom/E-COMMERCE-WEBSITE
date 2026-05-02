import { getDb } from "./_shared/db.mjs";
import { createPaypalOrder, getPaypalConfig } from "./_shared/paypal.mjs";
import {
  errorResponse,
  json,
  methodNotAllowed,
} from "./_shared/response.mjs";
import { getProductIdByTitle } from "./_shared/product-catalog.mjs";

async function resolveProductId(connection, item) {
  if (Number.isInteger(item.product_id) && item.product_id > 0) {
    return item.product_id;
  }

  if (item.title) {
    const mappedId = getProductIdByTitle(item.title);
    if (mappedId) {
      return mappedId;
    }

    const [rows] = await connection.execute(
      "SELECT id FROM products WHERE name = ? LIMIT 1",
      [item.title]
    );

    return rows[0]?.id ?? null;
  }

  return null;
}

export default async (req) => {
  if (req.method !== "POST") {
    return methodNotAllowed();
  }

  const paypalConfig = getPaypalConfig();
  if (!paypalConfig.configured) {
    return errorResponse("PayPal is not configured on the server", 503);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  const {
    first_name,
    last_name,
    email,
    street_address,
    city,
    state,
    zip_code,
    items,
    total_amount,
  } = body;

  if (
    !first_name ||
    !last_name ||
    !email ||
    !street_address ||
    !city ||
    !state ||
    !zip_code ||
    !Array.isArray(items) ||
    items.length === 0 ||
    !Number.isFinite(Number(total_amount))
  ) {
    return errorResponse("Missing required fields", 400);
  }

  const db = getDb();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
        first_name,
        last_name,
        email,
        street_address,
        city,
        state,
        zip_code,
        total_amount,
        payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        first_name,
        last_name,
        email,
        street_address,
        city,
        state,
        zip_code,
        Number(total_amount),
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      const productId = await resolveProductId(connection, item);

      if (!productId) {
        throw new Error(
          `Could not resolve product for order item: ${
            item.title || item.product_id || "unknown"
          }`
        );
      }

      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, productId, item.quantity, item.price]
      );
    }

    await connection.commit();

    const frontendUrl =
      Netlify.env.get("FRONTEND_URL") || new URL(req.url).origin;
    const paypalOrder = await createPaypalOrder(
      orderId,
      Number(total_amount),
      frontendUrl
    );

    return json({ orderId, paypalOrderId: paypalOrder.id });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating order:", error);
    return errorResponse("Failed to create order");
  } finally {
    connection.release();
  }
};

export const config = {
  path: "/api/orders",
};
