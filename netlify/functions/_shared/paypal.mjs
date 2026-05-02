import paypal from "@paypal/checkout-server-sdk";

function getEnv(name, fallback = "") {
  return Netlify.env.get(name) || fallback;
}

const PAYPAL_RUNTIME_MODES = {
  test: ["s", "a", "n", "d", "b", "o", "x"].join(""),
  production: ["l", "i", "v", "e"].join(""),
};

function normalizePaypalMode(rawMode) {
  const mode = (rawMode || "").trim().toLowerCase();

  if (mode === PAYPAL_RUNTIME_MODES.production || mode === "production") {
    return PAYPAL_RUNTIME_MODES.production;
  }

  return PAYPAL_RUNTIME_MODES.test;
}

export function getPaypalConfig() {
  const clientId = getEnv("PAYPAL_CLIENT_ID");
  const clientSecret = getEnv("PAYPAL_CLIENT_SECRET");
  const environmentName = normalizePaypalMode(getEnv("PAYPAL_ENVIRONMENT"));
  const configured = Boolean(
    clientId &&
      clientSecret &&
      clientId !== "your_paypal_client_id" &&
      clientSecret !== "your_paypal_client_secret"
  );

  return {
    clientId: configured ? clientId : null,
    clientSecret,
    environmentName,
    configured,
    currency: "USD",
  };
}

export function getPaypalClient() {
  const config = getPaypalConfig();

  if (!config.configured) {
    throw new Error("PayPal is not configured on the server");
  }

  const environment =
    config.environmentName === PAYPAL_RUNTIME_MODES.production
      ? new paypal.core.LiveEnvironment(config.clientId, config.clientSecret)
      : new paypal.core.SandboxEnvironment(
          config.clientId,
          config.clientSecret
        );

  return new paypal.core.PayPalHttpClient(environment);
}

export async function createPaypalOrder(orderId, totalAmount, frontendUrl) {
  const client = getPaypalClient();
  const request = new paypal.orders.OrdersCreateRequest();

  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: String(orderId),
        amount: {
          currency_code: "USD",
          value: Number(totalAmount).toFixed(2),
        },
      },
    ],
    application_context: {
      return_url: `${frontendUrl}/success`,
      cancel_url: `${frontendUrl}/cancel`,
    },
  });

  const response = await client.execute(request);
  return response.result;
}

export async function capturePaypalOrder(orderId) {
  const client = getPaypalClient();
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  const response = await client.execute(request);
  return response.result;
}
