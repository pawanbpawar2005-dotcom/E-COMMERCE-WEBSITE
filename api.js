// API utility functions
const API_BASE = '/api';

async function readJsonOrError(response, fallbackMessage) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage);
  }

  return data;
}

async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    return await readJsonOrError(response, 'Failed to fetch products');
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    return await readJsonOrError(response, 'Failed to create order');
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

async function capturePayment(orderId, paypalOrderId) {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paypalOrderId })
    });
    return await readJsonOrError(response, 'Failed to capture payment');
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw error;
  }
}
