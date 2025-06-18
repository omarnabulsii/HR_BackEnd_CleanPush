// ✅ routes/dashboard.js (Backend)
import express from "express"
import { pool } from "../db.js"

const router = express.Router()

router.get("/stats", async (req, res, next) => {
  try {
    const employeesResult = await pool.query("SELECT COUNT(*) as total FROM users WHERE role = $1", ["employee"])

    const activeEmployeesResult = await pool.query(
      "SELECT COUNT(*) as total FROM users WHERE status = $1 AND role = $2",
      ["Active", "employee"]
    )

    const pendingApplicationsResult = await pool.query(
      "SELECT COUNT(*) as total FROM job_applications WHERE status = $1",
      ["pending"]
    )

    const pendingRequestsResult = await pool.query(
      "SELECT COUNT(*) as total FROM requests WHERE status = $1",
      ["pending"]
    )

    const payrollResult = await pool.query(
      "SELECT SUM(net_salary) as total FROM users WHERE role = $1",
      ["employee"]
    )

    const recentActivitiesResult = await pool.query(
      "SELECT full_name, position, submitted_at FROM job_applications ORDER BY submitted_at DESC LIMIT 5"
    )

    const recentRequestsResult = await pool.query(
      "SELECT type, period_start, period_end, status, notes FROM requests ORDER BY created_at DESC LIMIT 5"
    )

    const stats = {
      totalEmployees: Number.parseInt(employeesResult.rows[0].total),
      activeEmployees: Number.parseInt(activeEmployeesResult.rows[0].total),
      pendingApplications: Number.parseInt(pendingApplicationsResult.rows[0].total),
      pendingRequests: Number.parseInt(pendingRequestsResult.rows[0].total),
      totalPayroll: Number.parseFloat(payrollResult.rows[0].total) || 0,
      recentActivities: recentActivitiesResult.rows,
      recentRequests: recentRequestsResult.rows,
    }

    res.json(stats)
  } catch (err) {
    next(err)
  }
})

export default router