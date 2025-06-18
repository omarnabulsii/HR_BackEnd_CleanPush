import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import usersRouter from "./routes/users.js";
import requestsRouter from "./routes/requests.js";
import jobApplicationsRouter from "./routes/jobapplications.js";
import payrollRouter from "./routes/payroll.js";
import timesheetsRouter from "./routes/timesheets.js";
import dashboardRouter from "./routes/dashboard.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Clicks HR Backend (no-auth) is running." });
});

// ✅ Mount routers — no checkJwt here
app.use("/api/users", usersRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/job-applications", jobApplicationsRouter);
app.use("/api/payroll", payrollRouter);
app.use("/api/timesheets", timesheetsRouter);
app.use("/api/dashboard", dashboardRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Listening on http://localhost:${PORT}`);
});
