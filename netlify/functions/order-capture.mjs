import { getDb } from "./_shared/db.mjs";
import { capturePaypalOrder, getPaypalConfig } from "./_shared/paypal.mjs";
import {
  errorResponse,
  json,
  methodNotAllowed,
} from "./_shared/response.mjs";

export default async (req, context) => {
  if (req.method !== "POST") {
    return methodNotAllowed();
  }

  if (!getPaypalConfig().configured) {
    return errorResponse("PayPal is not configured on the server", 503);
  }

  const orderId = Number.parseInt(context.params.id || "", 10);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return errorResponse("Invalid order ID", 400);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  if (!body.paypalOrderId) {
    return errorResponse("Missing PayPal order ID", 400);
  }

  try {
    const captureResult = await capturePaypalOrder(body.paypalOrderId);
    const db = getDb();

    await db.execute(
      `UPDATE orders SET payment_status = 'Completed', payment_id = ? WHERE id = ?`,
      [captureResult.id, orderId]
    );

    return json({ success: true, captureId: captureResult.id });
  } catch (error) {
    console.error("Error capturing payment:", error);
    return errorResponse("Failed to capture payment");
  }
};

export const config = {
  path: "/api/orders/:id/capture",
};
