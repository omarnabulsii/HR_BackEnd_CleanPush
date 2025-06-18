-- Database schema for HR System
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'employee',
    job_title VARCHAR(255),
    department VARCHAR(255),
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'Active',
    base_salary DECIMAL(10,2) DEFAULT 0,
    bonus DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) GENERATED ALWAYS AS (base_salary + bonus - deductions) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    position VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    work_location VARCHAR(255),
    classification VARCHAR(255),
    resume_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    documents JSONB DEFAULT '{}',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(100) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timesheets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (full_name, email, role, job_title, department, status) 
VALUES ('Admin User', '22110038@htu.edu.jo', 'admin', 'HR Manager', 'HR', 'Active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (full_name, email, role, job_title, department, status, base_salary, bonus, deductions) 
VALUES ('Omar Al Nabulsi', 'omaralnabulsi1@gmail.com', 'employee', 'Developer', 'Engineering', 'Active', 5000, 500, 200)
ON CONFLICT (email) DO NOTHING;
