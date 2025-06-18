import express from "express"
import { pool } from "../db.js"

const router = express.Router()

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
         id,
         full_name,
         base_salary,
         bonus,
         deductions,
         net_salary,
         created_at
       FROM users 
       WHERE base_salary > 0
       ORDER BY full_name`,
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
         id,
         full_name,
         base_salary,
         bonus,
         deductions,
         net_salary,
         created_at
       FROM users 
       WHERE id = $1`,
      [req.params.id],
    )

    if (!rows[0]) {
      return res.status(404).json({ message: "Payroll record not found" })
    }

    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

export default router
