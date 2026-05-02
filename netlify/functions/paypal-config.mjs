import { getPaypalConfig } from "./_shared/paypal.mjs";
import { json, methodNotAllowed } from "./_shared/response.mjs";

export default async (req) => {
  if (req.method !== "GET") {
    return methodNotAllowed();
  }

  const config = getPaypalConfig();

  return json({
    clientId: config.clientId,
    currency: config.currency,
    configured: config.configured,
  });
};

export const config = {
  path: "/api/config/paypal",
};
