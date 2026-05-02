// Checkout functionality
let currentOrderContext = null;

document.addEventListener('DOMContentLoaded', function() {
  loadOrderSummary();
  initializeCheckout();
});

function loadOrderSummary() {
  const cart = getCart();
  const summaryDiv = document.getElementById('order-summary');
  const totalDiv = document.getElementById('order-total');
  let total = 0;

  summaryDiv.innerHTML = '';

  if (cart.length === 0) {
    summaryDiv.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'd-flex justify-content-between mb-2';
    itemDiv.innerHTML = `
      <span>${item.title} x ${item.quantity}</span>
      <span>${formatCurrency(itemTotal)}</span>
    `;
    summaryDiv.appendChild(itemDiv);
  });

  totalDiv.textContent = formatCurrency(total);
}

async function initializeCheckout() {
  try {
    const paypalConfig = await fetchPayPalConfig();

    if (!paypalConfig.configured || !paypalConfig.clientId) {
      showCheckoutMessage('PayPal is not configured yet. Add valid PayPal credentials in the server environment to enable checkout.', 'warning');
      return;
    }

    await loadPayPalSdk(paypalConfig.clientId, paypalConfig.currency || 'USD');
    setupPayPalButtons();
  } catch (error) {
    console.error('Checkout initialization failed:', error);
    showCheckoutMessage('Unable to initialize PayPal checkout right now. Please try again later.', 'danger');
  }
}

async function fetchPayPalConfig() {
  const response = await fetch(`${API_BASE}/config/paypal`);
  return readJsonOrError(response, 'Failed to load PayPal configuration');
}

function loadPayPalSdk(clientId, currency) {
  return new Promise((resolve, reject) => {
    if (window.paypal?.Buttons) {
      resolve(window.paypal);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}`;
    script.async = true;
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.head.appendChild(script);
  });
}

function showCheckoutMessage(message, variant = 'info') {
  const container = document.getElementById('checkout-message');
  if (!container) {
    return;
  }

  container.innerHTML = `<div class="alert alert-${variant}" role="alert">${message}</div>`;
}

function setupPayPalButtons() {
  if (!window.paypal?.Buttons) {
    showCheckoutMessage('PayPal checkout is unavailable because the PayPal SDK did not load.', 'danger');
    return;
  }

  paypal.Buttons({
    createOrder: function(data, actions) {
      // Get shipping form data
      const formData = getShippingFormData();
      if (!formData) {
        alert('Please fill in all shipping details.');
        throw new Error('Missing shipping details.');
      }

      // Convert cart to order items
      const cart = getCart();
      const orderItems = cart.map(item => ({
        product_id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price
      }));

      if (orderItems.some(item => !Number.isInteger(item.product_id))) {
        throw new Error('Some cart items are missing product IDs. Please re-add them to your cart.');
      }

      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create order via API
      return createOrder({
        ...formData,
        items: orderItems,
        total_amount: totalAmount
      })
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        currentOrderContext = {
          orderId: data.orderId,
          paypalOrderId: data.paypalOrderId
        };
        return data.paypalOrderId;
      });
    },
    onApprove: function(data, actions) {
      // Capture the payment
      if (!currentOrderContext?.orderId) {
        throw new Error('Missing local order context for payment capture.');
      }

      return capturePayment(currentOrderContext.orderId, data.orderID)
      .then(data => {
        if (data.success) {
          // Clear cart and redirect to success page
          clearCart();
          currentOrderContext = null;
          alert('Payment successful! Order completed.');
          window.location.href = 'index.html';
        } else {
          alert('Payment failed. Please try again.');
        }
      });
    },
    onError: function(err) {
      console.error('PayPal error:', err);
      alert('An error occurred during payment. Please try again.');
    }
  }).render('#paypal-button-container');
}

function getShippingFormData() {
  const firstName = document.getElementById('first-name').value.trim();
  const lastName = document.getElementById('last-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const streetAddress = document.getElementById('street-address').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const zipCode = document.getElementById('zip-code').value.trim();

  if (!firstName || !lastName || !email || !streetAddress || !city || !state || !zipCode) {
    return null;
  }

  return {
    first_name: firstName,
    last_name: lastName,
    email: email,
    street_address: streetAddress,
    city: city,
    state: state,
    zip_code: zipCode
  };
}
