import { getDb } from "./_shared/db.mjs";
import { errorResponse, json, methodNotAllowed } from "./_shared/response.mjs";

export default async (req) => {
  if (req.method !== "GET") {
    return methodNotAllowed();
  }

  try {
    const db = getDb();
    const [rows] = await db.execute(
      "SELECT * FROM products WHERE in_stock = true ORDER BY id ASC"
    );

    return json(rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    return errorResponse("Failed to fetch products");
  }
};

export const config = {
  path: "/api/products",
};
