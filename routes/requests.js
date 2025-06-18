// routes/requests.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET all (or by user_id)
router.get("/", async (req, res) => {
  const { user_id } = req.query;
  const q = user_id
    ? ["SELECT * FROM requests WHERE user_id=$1 ORDER BY created_at DESC", [user_id]]
    : ["SELECT * FROM requests ORDER BY created_at DESC", []];
  const { rows } = await pool.query(...q);
  res.json(rows);
});

// POST create (user_id optional now)
router.post("/", async (req, res) => {
  const {
    user_id      = null,    // default to null if not provided
    type,
    period_start,
    period_end,
    notes
  } = req.body;

  // Only these three are now required:
  if (!type || !period_start || !period_end) {
    return res
      .status(400)
      .json({ message: "type, period_start and period_end are required" });
  }

  const { rows } = await pool.query(
    `
    INSERT INTO requests
      (user_id, type, period_start, period_end, notes)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [user_id, type, period_start, period_end, notes]
  );
  res.status(201).json(rows[0]);
});

// PUT update (unchanged)
router.put("/:id", async (req, res) => {
  const { user_id, type, period_start, period_end, status, notes } = req.body;
  const params = [user_id, type, period_start, period_end, status, notes, req.params.id];
  const exists = await pool.query("SELECT 1 FROM requests WHERE id=$1", [req.params.id]);
  if (!exists.rows.length) return res.status(404).json({ message: "Not found" });

  const { rows } = await pool.query(
    `
    UPDATE requests SET
      user_id      = COALESCE($1,user_id),
      type         = COALESCE($2,type),
      period_start = COALESCE($3,period_start),
      period_end   = COALESCE($4,period_end),
      status       = COALESCE($5,status),
      notes        = COALESCE($6,notes)
    WHERE id=$7 RETURNING *
    `,
    params
  );
  res.json(rows[0]);
});

// DELETE (unchanged)
router.delete("/:id", async (req, res) => {
  const del = await pool.query("DELETE FROM requests WHERE id=$1 RETURNING id", [req.params.id]);
  if (!del.rows.length) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
});

export default router;
