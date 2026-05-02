import mysql from "mysql2/promise";

let pool;

function getEnv(name, fallback = "") {
  return Netlify.env.get(name) || fallback;
}

export function getDb() {
  if (!pool) {
    pool = mysql.createPool({
      host: getEnv("DB_HOST", "localhost"),
      user: getEnv("DB_USER", "root"),
      password: getEnv("DB_PASSWORD", ""),
      database: getEnv("DB_NAME", "ecom_db"),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  return pool;
}
