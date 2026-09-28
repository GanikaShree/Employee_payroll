-- ============================================================================
-- EMPLOYEE PAYROLL MANAGEMENT SYSTEM - ANALYTICAL SQL QUERIES
-- Project Title: Employee Payroll Naming Convention
-- Use Case: Demonstrating database querying during B.Tech project presentation & viva
-- Naming Convention Rule: snake_case for all tables, columns, and query aliases
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Query: Retrieve all active employees with their department names
-- ----------------------------------------------------------------------------
SELECT 
    er.employee_id,
    er.employee_name,
    d.department_name,
    er.designation,
    er.basic_salary,
    er.working_days,
    er.overtime_hours
FROM 
    employee_records er
INNER JOIN 
    departments d ON er.department_id = d.department_id
WHERE 
    er.employment_status = 'ACTIVE'
ORDER BY 
    er.employee_name ASC;

-- ----------------------------------------------------------------------------
-- 2. Query: Calculate department-wise salary expenditure and employee count
-- ----------------------------------------------------------------------------
SELECT 
    d.department_name,
    COUNT(er.employee_id) AS total_headcount,
    ROUND(SUM(er.basic_salary), 2) AS total_basic_expenditure,
    ROUND(AVG(er.basic_salary), 2) AS average_department_salary,
    MAX(er.basic_salary) AS highest_salary,
    MIN(er.basic_salary) AS lowest_salary
FROM 
    departments d
LEFT JOIN 
    employee_records er ON d.department_id = er.department_id
GROUP BY 
    d.department_id, d.department_name
ORDER BY 
    total_basic_expenditure DESC;

-- ----------------------------------------------------------------------------
-- 3. Query: Identify employees with significant overtime (> 10 hours)
-- ----------------------------------------------------------------------------
SELECT 
    er.employee_id,
    er.employee_name,
    d.department_name,
    er.overtime_hours,
    ROUND((er.overtime_hours * (er.basic_salary / 240.0) * 1.5), 2) AS calculated_overtime_payout
FROM 
    employee_records er
JOIN 
    departments d ON er.department_id = d.department_id
WHERE 
    er.overtime_hours >= 10.0
ORDER BY 
    er.overtime_hours DESC;

-- ----------------------------------------------------------------------------
-- 4. Query: Top 3 highest earning employees
-- ----------------------------------------------------------------------------
SELECT 
    employee_id,
    employee_name,
    designation,
    basic_salary
FROM 
    employee_records
ORDER BY 
    basic_salary DESC
LIMIT 3;

-- ----------------------------------------------------------------------------
-- 5. Query: Generate monthly payroll disbursement report from transactions
-- ----------------------------------------------------------------------------
SELECT 
    pt.payroll_month,
    COUNT(pt.transaction_id) AS total_slips_processed,
    ROUND(SUM(pt.gross_salary), 2) AS total_gross_disbursed,
    ROUND(SUM(pt.total_deductions), 2) AS total_statutory_deductions,
    ROUND(SUM(pt.net_salary), 2) AS total_net_disbursed
FROM 
    payroll_transactions pt
GROUP BY 
    pt.payroll_month;
