const CART_KEY = "pcbuilder_cart_v1";

function getCart() {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function parsePrice(text = "") {
  const digits = (text || "").toString().replace(/[^\d]/g, "");
  return digits ? Number.parseInt(digits, 10) : 0;
}

function formatCurrency(value) {
  return `Rs ${Number(value).toLocaleString("en-IN")}`;
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  document.querySelectorAll(".cart-count").forEach((node) => {
    node.textContent = count;
  });
}

function addToCart(product) {
  if (!product.title || !product.price || product.price <= 0) {
    console.warn("Invalid product data for cart add", product);
    return;
  }

  const cart = getCart();
  const existing = cart.find((item) => item.title === product.title);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id ?? null,
      title: product.title,
      price: product.price,
      quantity: 1,
    });
  }

  saveCart(cart);
  showToast(`${product.title} has been added to your cart.`);
}

function removeFromCart(title) {
  const cart = getCart().filter((item) => item.title !== title);
  saveCart(cart);
  renderCartPage();
}

function updateItemQuantity(title, quantity) {
  const cart = getCart();
  const target = cart.find((item) => item.title === title);
  if (!target) return;

  target.quantity = Math.max(1, quantity);
  saveCart(cart);
  renderCartPage();
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartCount();
  renderCartPage();
}

function addCartButtonToNav() {
  const nav = document.querySelector(".navwrap nav");
  if (!nav) return;
  if (nav.querySelector(".cart-link")) return;

  const cartLink = document.createElement("a");
  cartLink.href = "cart.html";
  cartLink.className = "btn btn-warning btn-sm ms-2 cart-link position-relative";
  cartLink.innerHTML = `Cart <span class="badge bg-danger cart-count">0</span>`;
  nav.appendChild(cartLink);
}

function getProductDataFromButton(button) {
  if (!button) return null;
  const label = button.textContent.trim();
  if (label !== "Add to Cart") return null;

  const card = button.closest(".card");

  if (card) {
    const title = card.querySelector(".card-title")?.textContent.trim() || "";
    const priceTxt = card.querySelector(".fw-bold")?.textContent.trim() || card.querySelector(".card-text")?.textContent.trim() || "";
    const price = parsePrice(priceTxt);
    const id = Number.parseInt(button.dataset.productId || card.dataset.productId || "", 10);
    return { id: Number.isNaN(id) ? null : id, title, price };
  }

  const modal = button.closest(".modal");
  if (modal) {
    const title = modal.querySelector(".modal-title")?.textContent.trim() || "";
    const cardTitleSelector = `.card-title`; // fallback to product card lookup
    const cardMatch = Array.from(document.querySelectorAll(cardTitleSelector)).find((node) => node.textContent.trim() === title);
    const price = cardMatch ? parsePrice(cardMatch.closest(".card").querySelector(".fw-bold")?.textContent || "") : 0;
    const id = Number.parseInt(cardMatch?.closest(".card")?.dataset.productId || "", 10);
    return { id: Number.isNaN(id) ? null : id, title, price };
  }

  return null;
}

function installAddToCartListeners() {
  const clickHandler = (event) => {
    const button = event.target.closest("a, button");
    if (!button) return;

    if (button.textContent.trim() === "Add to Cart") {
      event.preventDefault();
      const product = getProductDataFromButton(button);
      if (product && product.title && product.price) {
        addToCart(product);
      } else {
        showToast("Product information is incomplete; could not add to cart.", "danger");
      }
    }
  };

  document.body.addEventListener("click", clickHandler);
}

function showToast(message, variant = "success") {
  const toastId = `cart-toast-${Date.now()}`;
  const toastArea = document.getElementById("cart-toasts") || createToastContainer();
  const toast = document.createElement("div");
  toast.id = toastId;
  toast.className = `toast align-items-center text-bg-${variant} border-0 show`;
  toast.role = "alert";
  toast.ariaLive = "assertive";
  toast.ariaAtomic = "true";
  toast.style.minWidth = "220px";
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastArea.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove("show");
    toast.remove();
  }, 2300);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "cart-toasts";
  container.style.position = "fixed";
  container.style.top = "1rem";
  container.style.right = "1rem";
  container.style.zIndex = "1055";
  document.body.appendChild(container);
  return container;
}

function renderCartPage() {
  if (!document.body.classList.contains("cart-page")) {
    return;
  }

  const root = document.getElementById("cart-root");
  if (!root) return;

  const cart = getCart();

  if (cart.length === 0) {
    root.innerHTML = `<div class="alert alert-info">Your cart is empty. <a href="product.html">Continue shopping</a>.</div>`;
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  root.innerHTML = `
    <div class="table-responsive">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Product</th>
            <th class="text-end">Unit Price</th>
            <th class="text-center">Qty</th>
            <th class="text-end">Subtotal</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${cart
            .map(
              (item) => `
                <tr>
                  <td>${item.title}</td>
                  <td class="text-end">${formatCurrency(item.price)}</td>
                  <td class="text-center">
                    <div class="input-group input-group-sm justify-content-center" style="max-width: 130px;">
                      <button class="btn btn-outline-secondary btn-decrement" data-title="${item.title}" type="button">-</button>
                      <input type="text" class="form-control text-center cart-qty" value="${item.quantity}" style="min-width: 45px;" readonly>
                      <button class="btn btn-outline-secondary btn-increment" data-title="${item.title}" type="button">+</button>
                    </div>
                  </td>
                  <td class="text-end">${formatCurrency(item.price * item.quantity)}</td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-danger btn-remove" data-title="${item.title}" type="button">Remove</button>
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
      <div>
        <button id="clear-cart" class="btn btn-outline-danger">Clear Cart</button>
      </div>
      <div class="text-end">
        <h5>Total: <strong>${formatCurrency(total)}</strong></h5>
        <a href="checkout.html" class="btn btn-success">Checkout</a>
      </div>
    </div>
  `;

  root.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.title));
  });

  root.querySelectorAll(".btn-increment").forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title;
      const existing = getCart().find((item) => item.title === title);
      if (!existing) return;
      updateItemQuantity(title, existing.quantity + 1);
    });
  });

  root.querySelectorAll(".btn-decrement").forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title;
      const existing = getCart().find((item) => item.title === title);
      if (!existing) return;
      if (existing.quantity <= 1) {
        removeFromCart(title);
      } else {
        updateItemQuantity(title, existing.quantity - 1);
      }
    });
  });

  const clearBtn = document.getElementById("clear-cart");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearCart);
  }
}

function openPaymentModal(totalAmount) {
  const modal = document.getElementById("payment-modal");
  const totalField = modal?.querySelector("#payment-total");
  if (totalField) {
    totalField.textContent = formatCurrency(totalAmount);
  }

  // reset form fields on every open
  const selected = modal?.querySelector('input[name="payment-method"]:checked');
  if (selected) {
    selected.checked = false;
  }
  const details = modal?.querySelector("#payment-details");
  if (details) {
    details.innerHTML = "";
  }

  const paymentModal = new bootstrap.Modal(modal);
  paymentModal.show();
}

function renderPaymentDetails(method) {
  const details = document.getElementById("payment-details");
  if (!details) {
    return;
  }

  if (method === "Credit Card" || method === "Debit Card") {
    details.innerHTML = `
      <div class="mb-3">
        <label class="form-label" for="card-number">Card Number</label>
        <input type="text" class="form-control" id="card-number" placeholder="XXXX XXXX XXXX XXXX" maxlength="19" required>
      </div>
      <div class="row">
        <div class="col-6 mb-3">
          <label class="form-label" for="card-expiry">Expiry (MM/YY)</label>
          <input type="text" class="form-control" id="card-expiry" placeholder="MM/YY" maxlength="5" required>
        </div>
        <div class="col-6 mb-3">
          <label class="form-label" for="card-cvv">CVV</label>
          <input type="password" class="form-control" id="card-cvv" placeholder="123" maxlength="4" required>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label" for="card-name">Name on Card</label>
        <input type="text" class="form-control" id="card-name" placeholder="Cardholder Name" required>
      </div>
    `;
  } else if (method === "Net Banking") {
    details.innerHTML = `
      <div class="mb-3">
        <p>Please choose a UPI app for payment:</p>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="upi-app" id="upi-phonepay" value="PhonePe">
          <label class="form-check-label" for="upi-phonepay">PhonePe</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="upi-app" id="upi-gpay" value="GPay">
          <label class="form-check-label" for="upi-gpay">Google Pay</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="upi-app" id="upi-paytm" value="Paytm">
          <label class="form-check-label" for="upi-paytm">Paytm</label>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label" for="upi-id">UPI ID</label>
        <input type="text" class="form-control" id="upi-id" placeholder="example@bank" required>
      </div>
    `;
  } else {
    details.innerHTML = "";
  }
}

function setupPaymentModal() {
  const modal = document.getElementById("payment-modal");
  if (!modal) {
    return;
  }

  const form = modal.querySelector("#payment-form");
  if (!form) {
    return;
  }

  const methodRadios = modal.querySelectorAll('input[name="payment-method"]');
  methodRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      renderPaymentDetails(radio.value);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const selected = modal.querySelector('input[name="payment-method"]:checked');
    if (!selected) {
      showToast("Please choose a payment method.", "warning");
      return;
    }

    const method = selected.value;
    const orderedTotal = modal.querySelector("#payment-total")?.textContent || "";

    if (method === "Credit Card" || method === "Debit Card") {
      const number = modal.querySelector("#card-number")?.value.trim();
      const expiry = modal.querySelector("#card-expiry")?.value.trim();
      const cvv = modal.querySelector("#card-cvv")?.value.trim();
      const name = modal.querySelector("#card-name")?.value.trim();

      if (!number || !expiry || !cvv || !name) {
        showToast("Please fill in all card details.", "warning");
        return;
      }

      if (!/^\d{12,19}$/.test(number.replace(/\s+/g, ""))) {
        showToast("Please enter a valid card number.", "warning");
        return;
      }

      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        showToast("Please enter expiry in MM/YY format.", "warning");
        return;
      }

      if (!/^\d{3,4}$/.test(cvv)) {
        showToast("Please enter a valid CVV.", "warning");
        return;
      }
    } else if (method === "Net Banking") {
      const upiApp = modal.querySelector('input[name="upi-app"]:checked')?.value;
      const upiId = modal.querySelector("#upi-id")?.value.trim();

      if (!upiApp) {
        showToast("Please select a UPI app.", "warning");
        return;
      }

      if (!upiId) {
        showToast("Please enter your UPI ID.", "warning");
        return;
      }

      if (!/^[a-zA-Z0-9_.-]+@[a-zA-Z]+$/.test(upiId)) {
        showToast("Please enter a valid UPI ID.", "warning");
        return;
      }

      showToast(`Payment method: ${upiApp} (UPI ID: ${upiId})`, "info");
    }

    const successMsg = `Payment successful via ${method} for ${orderedTotal}. Thank you!`;
    showToast(successMsg, "success");

    clearCart();
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    if (bootstrapModal) {
      bootstrapModal.hide();
    }
  });
}

function initCart() {
  addCartButtonToNav();
  installAddToCartListeners();
  updateCartCount();
  renderCartPage();
  setupPaymentModal();
}

document.addEventListener("DOMContentLoaded", initCart);
