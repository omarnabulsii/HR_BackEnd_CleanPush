import express from "express"
import { pool } from "../db.js"

const router = express.Router()

router.get("/", async (req, res, next) => {
  try {
    const { user_id } = req.query
    let query, params

    if (user_id) {
      query = `
        SELECT t.*, u.full_name,
               CASE 
                 WHEN t.check_out IS NOT NULL AND t.check_in IS NOT NULL 
                 THEN EXTRACT(EPOCH FROM (t.check_out::time - t.check_in::time))/3600
                 ELSE 0 
               END as total_hours
        FROM timesheets t
        JOIN users u ON t.user_id = u.id
        WHERE t.user_id = $1
        ORDER BY t.date DESC
      `
      params = [user_id]
    } else {
      query = `
        SELECT t.*, u.full_name,
               CASE 
                 WHEN t.check_out IS NOT NULL AND t.check_in IS NOT NULL 
                 THEN EXTRACT(EPOCH FROM (t.check_out::time - t.check_in::time))/3600
                 ELSE 0 
               END as total_hours
        FROM timesheets t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.date DESC
      `
      params = []
    }

    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, u.full_name,
              CASE 
                WHEN t.check_out IS NOT NULL AND t.check_in IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (t.check_out::time - t.check_in::time))/3600
                ELSE 0 
              END as total_hours
       FROM timesheets t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [req.params.id],
    )

    if (!rows[0]) {
      return res.status(404).json({ message: "Timesheet not found" })
    }

    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})
router.post("/check-in", async (req, res, next) => {
  try {
    const { user_id } = req.body;
    const date = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().split(" ")[0];

    // Check if already exists
    const existing = await pool.query(
      "SELECT * FROM timesheets WHERE user_id=$1 AND date=$2",
      [user_id, date]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Already checked in today." });
    }

    const { rows } = await pool.query(
      `INSERT INTO timesheets (user_id, date, check_in)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, date, now]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/timesheets/check-out
router.post("/check-out", async (req, res, next) => {
  try {
    const { user_id } = req.body;
    const date = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().split(" ")[0];

    const existing = await pool.query(
      "SELECT * FROM timesheets WHERE user_id=$1 AND date=$2",
      [user_id, date]
    );

    if (existing.rows.length === 0) {
      return res.status(400).json({ message: "You haven't checked in yet." });
    }

    const { rows } = await pool.query(
      `UPDATE timesheets
       SET check_out = $1
       WHERE user_id = $2 AND date = $3
       RETURNING *`,
      [now, user_id, date]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router
