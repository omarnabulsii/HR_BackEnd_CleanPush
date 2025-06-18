import express from 'express';
import { pool } from '../db.js';
import { checkJwt } from '../middleware/auth.js';

const router = express.Router();
const logger = console;

// GET all users (protected)
router.get('/', checkJwt, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         id,
         full_name,
         email,
         phone,
         role,
         job_title,
         department,
         hire_date,
         status,
         base_salary,
         bonus,
         deductions,
         net_salary,
         created_at,
         updated_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET one user by id (protected)
router.get('/:id', checkJwt, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         id,
         full_name,
         email,
         phone,
         role,
         job_title,
         department,
         hire_date,
         status,
         base_salary,
         bonus,
         deductions,
         net_salary,
         created_at,
         updated_at
       FROM users
       WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// CREATE a new user (protected)
router.post('/', checkJwt, async (req, res, next) => {
  logger.info('POST /users › payload:', req.body);

  try {
    const {
      full_name,
      email,
      phone,
      password,
      role,
      job_title,
      department,
      hire_date,
      base_salary = 0,
      bonus = 0,
      deductions = 0
    } = req.body;

    const missing = [];
    if (!full_name) missing.push('full_name');
    if (!email)      missing.push('email');
    if (!password)   missing.push('password');
    if (!role)       missing.push('role');

    if (missing.length) {
      logger.warn(`400 Bad Request › missing fields: ${missing.join(', ')}`);
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    logger.info('Inserting new user with values:', {
      full_name,
      email,
      phone,
      role,
      job_title,
      department,
      hire_date,
      base_salary,
      bonus,
      deductions
    });

    const { rows } = await pool.query(
      `INSERT INTO users
         (full_name,email,phone,password,role,job_title,department,hire_date,
          base_salary,bonus,deductions)
       VALUES
         ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING
         id, full_name, email, phone, role, job_title, department,
         hire_date, status, base_salary, bonus, deductions, net_salary,
         created_at, updated_at`,
      [
        full_name,
        email,
        phone,
        password,
        role,
        job_title,
        department,
        hire_date,
        base_salary,
        bonus,
        deductions
      ]
    );

    logger.info('User created with ID:', rows[0].id);
    res.status(201).json(rows[0]);

  } catch (err) {
    logger.error('500 Internal Server Error › creating user:', err.stack || err);
    next(err);
  }
});

// UPDATE an existing user (protected)
router.put('/:id', checkJwt, async (req, res, next) => {
  try {
    const fields = [
      'full_name',
      'email',
      'phone',
      'password',
      'role',
      'job_title',
      'department',
      'hire_date',
      'status',
      'base_salary',
      'bonus',
      'deductions'
    ];
    const vals = fields.map(f => req.body[f] ?? null);
    vals.push(req.params.id);

    const exists = await pool.query('SELECT 1 FROM users WHERE id=$1', [req.params.id]);
    if (!exists.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { rows } = await pool.query(
      `UPDATE users SET
         full_name   = COALESCE($1, full_name),
         email       = COALESCE($2, email),
         phone       = COALESCE($3, phone),
         password    = COALESCE($4, password),
         role        = COALESCE($5, role),
         job_title   = COALESCE($6, job_title),
         department  = COALESCE($7, department),
         hire_date   = COALESCE($8, hire_date),
         status      = COALESCE($9, status),
         base_salary = COALESCE($10, base_salary),
         bonus       = COALESCE($11, bonus),
         deductions  = COALESCE($12, deductions),
         updated_at  = CURRENT_TIMESTAMP
       WHERE id=$13
       RETURNING
         id, full_name, email, phone, role, job_title, department,
         hire_date, status, base_salary, bonus, deductions, net_salary,
         created_at, updated_at`,
      vals
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE a user (protected)
router.delete('/:id', checkJwt, async (req, res, next) => {
  try {
    const del = await pool.query('DELETE FROM users WHERE id=$1 RETURNING id', [req.params.id]);
    if (!del.rows.length) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
