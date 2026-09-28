-- ============================================================================
-- EMPLOYEE PAYROLL MANAGEMENT SYSTEM (DATABASE SCHEMA)
-- Project Title: Employee Payroll Naming Convention
-- Standard: ANSI SQL (Compatible with SQLite, MySQL, PostgreSQL)
-- Naming Convention Rule: snake_case for all table and column identifiers
-- ============================================================================

-- Drop existing tables if re-initializing
DROP TABLE IF EXISTS payroll_transactions;
DROP TABLE IF EXISTS employee_records;
DROP TABLE IF EXISTS departments;

-- ----------------------------------------------------------------------------
-- 1. Table: departments
-- Description: Stores organizational departments
-- ----------------------------------------------------------------------------
CREATE TABLE departments (
    department_id VARCHAR(10) PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    department_head VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. Table: employee_records
-- Description: Master table storing employee demographic and base compensation
-- ----------------------------------------------------------------------------
CREATE TABLE employee_records (
    employee_id VARCHAR(20) PRIMARY KEY,
    employee_name VARCHAR(100) NOT NULL,
    department_id VARCHAR(10) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    basic_salary DECIMAL(10, 2) NOT NULL CHECK (basic_salary > 0),
    working_days INT NOT NULL DEFAULT 30 CHECK (working_days BETWEEN 0 AND 30),
    overtime_hours DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (overtime_hours >= 0),
    employment_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (employment_status IN ('ACTIVE', 'ON_LEAVE', 'TERMINATED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 3. Table: payroll_transactions
-- Description: Records monthly generated payroll calculations and disbursements
-- ----------------------------------------------------------------------------
CREATE TABLE payroll_transactions (
    transaction_id VARCHAR(30) PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    payroll_month VARCHAR(15) NOT NULL,     -- e.g., 'September 2026'
    basic_salary DECIMAL(10, 2) NOT NULL,
    working_days INT NOT NULL,
    overtime_hours DECIMAL(5, 2) NOT NULL,
    
    -- Calculated Earnings Breakdown
    basic_pay DECIMAL(10, 2) NOT NULL,
    overtime_pay DECIMAL(10, 2) NOT NULL,
    hra_amount DECIMAL(10, 2) NOT NULL,
    da_amount DECIMAL(10, 2) NOT NULL,
    conveyance_amount DECIMAL(10, 2) NOT NULL,
    medical_amount DECIMAL(10, 2) NOT NULL,
    total_allowances DECIMAL(10, 2) NOT NULL,
    gross_salary DECIMAL(10, 2) NOT NULL,
    
    -- Calculated Deductions Breakdown
    pf_deduction DECIMAL(10, 2) NOT NULL,
    professional_tax DECIMAL(10, 2) NOT NULL,
    income_tax DECIMAL(10, 2) NOT NULL,
    total_deductions DECIMAL(10, 2) NOT NULL,
    
    -- Final Net Payable
    net_salary DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PROCESSED' CHECK (payment_status IN ('PENDING', 'PROCESSED', 'PAID')),
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employee_records(employee_id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- Indexes for performance optimization
-- ----------------------------------------------------------------------------
CREATE INDEX idx_emp_department ON employee_records(department_id);
CREATE INDEX idx_emp_name ON employee_records(employee_name);
CREATE INDEX idx_payroll_emp_month ON payroll_transactions(employee_id, payroll_month);

-- ============================================================================
-- INITIAL SEED DATA INSERTIONS (All names use snake_case attributes)
-- ============================================================================

-- Insert sample departments
INSERT INTO departments (department_id, department_name, department_head) VALUES
('DEP-ENG', 'Engineering', 'Vikramaditya Nair'),
('DEP-HR', 'Human Resources', 'Priya Venkatesh'),
('DEP-FIN', 'Finance', 'Rohan Deshmukh'),
('DEP-OPS', 'Operations', 'Aarav Sharma'),
('DEP-QA', 'Quality Assurance', 'Sneha Kulkarni');

-- Insert sample employee records
INSERT INTO employee_records (
    employee_id,
    employee_name,
    department_id,
    designation,
    basic_salary,
    working_days,
    overtime_hours,
    employment_status
) VALUES
('EMP-1001', 'Aarav Sharma', 'DEP-ENG', 'Senior Software Engineer', 65000.00, 30, 12.00, 'ACTIVE'),
('EMP-1002', 'Priya Venkatesh', 'DEP-HR', 'HR Operations Lead', 48000.00, 29, 0.00, 'ACTIVE'),
('EMP-1003', 'Rohan Deshmukh', 'DEP-FIN', 'Financial Analyst', 52000.00, 28, 6.00, 'ACTIVE'),
('EMP-1004', 'Ananya Sen', 'DEP-ENG', 'Frontend Developer', 42000.00, 30, 15.00, 'ACTIVE'),
('EMP-1005', 'Vikramaditya Nair', 'DEP-OPS', 'Operations Executive', 35000.00, 26, 8.00, 'ACTIVE'),
('EMP-1006', 'Sneha Kulkarni', 'DEP-QA', 'QA Automation Engineer', 45000.00, 30, 4.00, 'ACTIVE');

-- Insert sample payroll transaction records for demonstration
INSERT INTO payroll_transactions (
    transaction_id,
    employee_id,
    payroll_month,
    basic_salary,
    working_days,
    overtime_hours,
    basic_pay,
    overtime_pay,
    hra_amount,
    da_amount,
    conveyance_amount,
    medical_amount,
    total_allowances,
    gross_salary,
    pf_deduction,
    professional_tax,
    income_tax,
    total_deductions,
    net_salary,
    payment_status,
    payment_date
) VALUES
(
    'TXN-202609-1001',
    'EMP-1001',
    'September 2026',
    65000.00,
    30,
    12.00,
    65000.00,
    4875.00,
    13000.00,
    6500.00,
    1200.00,
    1500.00,
    22200.00,
    92075.00,
    7800.00,
    200.00,
    2103.75,
    10103.75,
    81971.25,
    'PAID',
    '2026-09-30'
);
