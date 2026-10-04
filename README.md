# Employee Payroll Management System
### Academic Title: Employee Payroll Naming Convention
**A Clean, Standardized Web-Based Payroll Management System for B.Tech Academic Projects**

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Standardized Naming Conventions Guide](#-standardized-naming-conventions-guide)
4. [Mathematical Payroll Calculation Formulas](#-mathematical-payroll-calculation-formulas)
5. [Project Folder Structure](#-project-folder-structure)
6. [Database Schema (SQL)](#-database-schema-sql)
7. [Step-by-Step Execution Guide](#-step-by-step-execution-guide)
8. [Sample Input & Output](#-sample-input--output)
9. [College Viva & Presentation Q&A Preparation](#-college-viva--presentation-qa-preparation)

---

## 🎯 Project Overview
The **Employee Payroll Management System** is an enterprise-grade academic web application designed to demonstrate clean code architecture, modular design patterns, and strict adherence to software naming conventions. 

It handles complete employee lifecycle compensation management:
- Storing core employee credentials (ID, Name, Department, Designation)
- Dynamic pro-rated basic pay calculation based on days worked
- Overtime computation with a 1.5x hourly rate multiplier
- Automatic statutory allowance computations (HRA, DA, Medical, Conveyance)
- Statutory deductions calculation (Provident Fund 12%, Professional Tax, TDS)
- Instant generation of printable official salary slips (payslips)

---

## ✨ Key Features
- **Role-Based Access Control (RBAC) & Authentication**:
  - **Administrator (`Admin` / `Admin@123`)**: Has full edit and modify privileges. Admin is the **only** user who can add new employees, edit employee compensation details, delete/remove records, and reset sample data.
  - **Other Users / Staff Viewers (`viewer` / `viewer123` or newly registered accounts)**: Restricted to read-only viewing and reporting. They can inspect the live dashboard metrics, search and filter records, view detailed salary payslips, and **download/export full payroll reports (CSV)**. All modification controls (Add, Edit, Delete, Reset) are automatically hidden and protected by client-side security guards.
  - **1-Click Auto-Fill Demo Credentials**: Buttons provided on the login page to immediately test both **Admin** and **Viewer** roles during presentations.
- **Smart Employee Name Auto-Capitalization**: Automatically capitalizes the first letter of every word entered in the employee name field (e.g., `rahul verma` $\rightarrow$ `Rahul Verma`) both in real time and on submission.
- **Employee CRUD Operations (Admin Only)**: Add, Edit, and Delete employee records with full form validation and automatic sequential ID renumbering.
- **Live Real-time Calculation Preview**: As you type basic salary, working days, or overtime hours in the form, the system immediately calculates and previews Basic Pay, Allowances, Deductions, and Net Salary before saving.
- **Search & Filtering**: Real-time instant search by Employee ID or Name, alongside Department filter dropdown and salary/name sorting.
- **Downloadable & Printable Reports**:
  - **Download Report (CSV)**: Export the complete company payroll register into a CSV spreadsheet.
  - **Printable Salary Slip (Payslip)**: Generates an official, bordered salary payslip with company header, dual-column earnings/deductions breakdown, net pay in numbers and words (e.g. *INR Eighty-One Thousand Nine Hundred Seventy-One Rupees Only*), verification stamp, and signatures.
- **Persistent Storage**: Utilizes browser LocalStorage with automatic sample data seeding. Changes persist across browser refreshes.
- **Interactive Naming Convention Guide**: A dedicated in-app documentation tab showcasing the rules, code examples, and database mapping.
- **Ready Database Integration**: Complete SQL DDL scripts (`database/schema.sql`), analytical queries (`database/sample_queries.sql`), and a Python SQLite initializer script (`database/init_db.py`).

---

## 🏷️ Standardized Naming Conventions Guide

This project strictly implements standard naming conventions across every layer:

| Element | Convention | Examples | Code Location |
| :--- | :--- | :--- | :--- |
| **Variables & Object Keys** | `camelCase` | `employeeId`, `employeeName`, `basicSalary`, `overtimeHours`, `netSalary` | `js/models.js`, `js/app.js` |
| **Functions & Methods** | `camelCase` | `calculateNetSalary()`, `renderEmployeeTable()`, `handleFormSubmit()` | `js/models.js`, `js/app.js` |
| **Classes & Constructors** | `PascalCase` | `Employee`, `PayrollCalculator`, `PayrollBreakdown`, `StorageManager` | `js/models.js`, `js/storage.js` |
| **Global Constants** | `UPPER_SNAKE_CASE` | `DEFAULT_MONTH_WORKING_DAYS`, `HRA_PERCENTAGE`, `LOCAL_STORAGE_KEY` | `js/constants.js` |
| **Database Tables** | `snake_case` | `employee_records`, `payroll_transactions`, `departments` | `database/schema.sql` |
| **Database Columns** | `snake_case` | `employee_id`, `employee_name`, `basic_salary`, `working_days` | `database/schema.sql` |
| **HTML Element IDs** | `kebab-case` | `id="employee-form"`, `id="search-input"`, `id="payroll-data-table"` | `index.html` |
| **CSS Classes & Selectors** | `kebab-case` | `class="stat-card"`, `class="btn-primary"`, `class="modal-backdrop"` | `css/style.css` |

---

## 🧮 Mathematical Payroll Calculation Formulas

The calculations in [`PayrollCalculator`](js/models.js) mirror standard corporate payroll practices:

### 1. Basic Pay (Pro-rated for attendance)
$$\text{Daily Rate} = \frac{\text{basicSalary}}{30}$$
$$\text{Basic Pay} = \text{Daily Rate} \times \text{workingDays}$$

### 2. Overtime Pay
$$\text{Standard Hourly Rate} = \frac{\text{basicSalary}}{30 \times 8} = \frac{\text{basicSalary}}{240}$$
$$\text{Overtime Hourly Rate} = \text{Standard Hourly Rate} \times 1.5$$
$$\text{Overtime Pay} = \text{overtimeHours} \times \text{Overtime Hourly Rate}$$

### 3. Allowances (Earnings)
- **House Rent Allowance (HRA)**: $20\%$ of Basic Pay
- **Dearness Allowance (DA)**: $10\%$ of Basic Pay
- **Conveyance Allowance**: Fixed ₹$1,200.00$
- **Medical Allowance**: Fixed ₹$1,500.00$
$$\text{Total Allowances} = \text{HRA} + \text{DA} + \text{Conveyance} + \text{Medical}$$

### 4. Statutory Deductions
- **Provident Fund (PF)**: $12\%$ of Basic Pay
- **Professional Tax (PT)**: Fixed ₹$200.00$
- **TDS / Income Tax**: $5\%$ on gross earnings exceeding ₹$50,000.00$
$$\text{Total Deductions} = \text{PF} + \text{PT} + \text{Income Tax}$$

### 5. Gross Salary & Net Salary
$$\text{Gross Salary} = \text{Basic Pay} + \text{Overtime Pay} + \text{Total Allowances}$$
$$\text{Net Salary} = \text{Gross Salary} - \text{Total Deductions}$$

---

## 📁 Project Folder Structure

```
Employee payroll/
│
├── index.html                      # Semantic HTML5 user interface (kebab-case IDs/classes)
│
├── css/
│   └── style.css                   # Custom responsive styling and print stylesheet
│
├── js/
│   ├── constants.js                # Global constants (UPPER_SNAKE_CASE)
│   ├── models.js                   # OOP models & calculation engine (PascalCase classes)
│   ├── storage.js                  # LocalStorage CRUD manager (StorageManager)
│   ├── sampleData.js               # Initial sample test employees
│   └── app.js                      # Application controller & DOM event handling
│
├── database/
│   ├── schema.sql                  # Relational database DDL and DML (snake_case)
│   ├── sample_queries.sql          # Analytical SQL queries for college viva
│   ├── init_db.py                  # Python script to generate SQLite database
│   └── employee_payroll.db         # Pre-initialized SQLite database file
│
├── docs/
│   └── naming_conventions.md       # Full documentation of architectural naming rules
│
└── README.md                       # Comprehensive project documentation
```

---

## 🗄️ Database Schema (SQL)

All tables and columns use `snake_case` according to SQL best practices:

### 1. `departments` Table
```sql
CREATE TABLE departments (
    department_id VARCHAR(10) PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    department_head VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `employee_records` Table
```sql
CREATE TABLE employee_records (
    employee_id VARCHAR(20) PRIMARY KEY,
    employee_name VARCHAR(100) NOT NULL,
    department_id VARCHAR(10) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    basic_salary DECIMAL(10, 2) NOT NULL CHECK (basic_salary > 0),
    working_days INT NOT NULL DEFAULT 30 CHECK (working_days BETWEEN 0 AND 30),
    overtime_hours DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (overtime_hours >= 0),
    employment_status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);
```

### 3. `payroll_transactions` Table
```sql
CREATE TABLE payroll_transactions (
    transaction_id VARCHAR(30) PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    payroll_month VARCHAR(15) NOT NULL,
    basic_salary DECIMAL(10, 2) NOT NULL,
    working_days INT NOT NULL,
    overtime_hours DECIMAL(5, 2) NOT NULL,
    basic_pay DECIMAL(10, 2) NOT NULL,
    overtime_pay DECIMAL(10, 2) NOT NULL,
    total_allowances DECIMAL(10, 2) NOT NULL,
    gross_salary DECIMAL(10, 2) NOT NULL,
    total_deductions DECIMAL(10, 2) NOT NULL,
    net_salary DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PROCESSED',
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee_records(employee_id)
);
```

---

## 🚀 Step-by-Step Execution Guide

### Option 1: Instant Run using Python HTTP Server (Recommended)
Since ES6 modules are used for modularity, serve the directory via any local HTTP server:
1. Open PowerShell / Command Prompt in the project folder:
   ```powershell
   cd "c:\Users\ggani\OneDrive\Desktop\Employee payroll"
   ```
2. Start the lightweight Python server:
   ```bash
   python -m http.server 3000
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Option 2: Run using Node.js / NPX
```bash
npx serve .
```

### Option 3: Run Database Utility (Python + SQLite)
To demonstrate the relational SQL backend in terminal:
```bash
python database/init_db.py
```

---

## 📊 Sample Input & Output

### Sample Input:
- **Employee ID**: `EMP-1001`
- **Employee Name**: `Aarav Sharma`
- **Department**: `Engineering`
- **Designation**: `Senior Software Engineer`
- **Basic Monthly Salary**: `₹65,000.00`
- **Working Days**: `30`
- **Overtime Hours**: `12`

### Calculated Output:
- **Basic Pay**: `₹65,000.00` (30/30 days)
- **Overtime Pay**: `₹4,875.00` (12 hrs @ ₹406.25/hr)
- **HRA (20%)**: `₹13,000.00`
- **DA (10%)**: `₹6,500.00`
- **Conveyance & Medical**: `₹2,700.00`
- **Total Allowances**: `₹22,200.00`
- **Gross Salary**: `₹92,075.00`
- **PF (12%)**: `₹7,800.00`
- **Professional Tax**: `₹200.00`
- **Income Tax (TDS)**: `₹2,103.75`
- **Total Deductions**: `₹10,103.75`
- **Net Salary**: `₹81,971.25`
- **Amount in Words**: `INR Eighty-One Thousand Nine Hundred Seventy-One Rupees Only`

---

## 🎓 College Viva & Presentation Q&A Preparation

#### Q1. Why did you use camelCase for JavaScript variables and snake_case for the database?
> **Answer:** "JavaScript and JSON standards recommend `camelCase` for variable names and object properties, ensuring consistency with ECMAScript built-in APIs. In contrast, relational SQL databases (like MySQL and PostgreSQL) are traditionally case-insensitive on certain operating systems (like Windows) and case-sensitive on others (like Linux). Standard ANSI SQL adopts `snake_case` using underscores to guarantee portability without quotation wrapping."

#### Q2. How is Net Salary computed in your system?
> **Answer:** "Net Salary is calculated as:  
> $\text{Net Salary} = (\text{Basic Pay} + \text{Overtime Pay} + \text{Total Allowances}) - \text{Total Deductions}$.  
> Basic pay is pro-rated based on days attended out of a standard 30-day month. Overtime is paid at 1.5 times the standard hourly rate."

#### Q3. Where is the data stored when using the web application?
> **Answer:** "The application uses HTML5 `localStorage` through a dedicated `StorageManager` class, serializing objects to JSON. For enterprise SQL environments, we have also authored the full relational schema in `schema.sql` and provided a working Python SQLite backend in `database/init_db.py`."

#### Q4. How does the live calculation preview work?
> **Answer:** "We attach `input` event listeners to the Basic Salary, Working Days, and Overtime input fields. Whenever the user modifies any number, `updateLiveCalculationPreview()` instantly invokes the pure `PayrollCalculator.calculatePayroll()` method and updates the preview text nodes in the DOM without submitting the form."

#### Q5. How does Role-Based Access Control (RBAC) work in your application?
> **Answer:** "The system implements two distinct access tiers:
> 1. **Administrator (`Admin`)**: Has full edit and write privileges. The Admin can add new employees, edit salaries/working days, delete records with automatic ID resequencing, and reset sample data.
> 2. **Other Users / Viewers (`viewer` or registered users)**: Have read-only privileges. They can view summary statistics, search and filter employees, generate payslips, and download/export full payroll CSV reports. All modification buttons and dialogs are completely hidden in the UI and protected by client-side JavaScript permission guards (`isCurrentUserAdmin()`)."
