import jwt from "jsonwebtoken";
import pool from "../db/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userRes = await pool.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [payload.id],
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = userRes.rows[0];
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
