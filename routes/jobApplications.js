import express from "express";
import { pool } from "../db.js";
import { checkJwt } from "../middleware/auth.js";


const router = express.Router();

// ✅ PUBLIC route for job applications
router.post("/public", async (req, res, next) => {
  try {
    const {
      full_name,
      email,
      phone,
      position,
      department = "",
      work_location = "",
      classification = "",
      resume_url = "",
    } = req.body;

    if (!full_name || !email || !position) {
      return res.status(400).json({
        message: "Full name, email, and position are required",
      });
    }

    // ✅ Updated to match 12 columns in DB table
    const { rows } = await pool.query(
      `INSERT INTO job_applications
         (full_name, email, phone, position, department, 
          work_location, classification, resume_url, status,
          user_id, hire_date, documents)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        full_name,
        email,
        phone,
        position,
        department,
        work_location,
        classification,
        resume_url,
        "pending",
        null,                          // user_id
        null,                          // hire_date
        resume_url || null             // documents = same as resume if no upload field

      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("❌ Failed to insert job application:", err);
    next(err);
  }
});

// ✅ Protected routes (only after public)
router.use(checkJwt);

router.get("/", async (req, res, next) => {
  try {
    const { user_id } = req.query;
    const q = user_id
      ? ["SELECT * FROM job_applications WHERE user_id=$1 ORDER BY submitted_at DESC", [user_id]]
      : ["SELECT * FROM job_applications ORDER BY submitted_at DESC", []];
    const { rows } = await pool.query(...q);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM job_applications WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Application not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { status, full_name, position, department, work_location, classification } = req.body;
    const exists = await pool.query("SELECT 1 FROM job_applications WHERE id=$1", [req.params.id]);

    if (!exists.rows.length) {
      return res.status(404).json({ message: "Application not found" });
    }

    const { rows } = await pool.query(
      `UPDATE job_applications SET
         status = COALESCE($1, status),
         full_name = COALESCE($2, full_name),
         position = COALESCE($3, position),
         department = COALESCE($4, department),
         work_location = COALESCE($5, work_location),
         classification = COALESCE($6, classification)
       WHERE id=$7 RETURNING *`,
      [status, full_name, position, department, work_location, classification, req.params.id]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/:id/hold", async (req, res, next) => {
  try {
    const result = await pool.query(
      "UPDATE job_applications SET status = 'onhold' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Application not found" });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const del = await pool.query("DELETE FROM job_applications WHERE id=$1 RETURNING id", [req.params.id]);
    if (!del.rows.length) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Application deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
