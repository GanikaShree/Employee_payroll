# Standardized Naming Conventions Guide
**Project Title:** Employee Payroll Naming Convention  
**Course / Degree:** B.Tech Computer Science & Engineering  
**Subject:** Software Engineering & Web Technologies Lab  

---

## 1. Overview of Naming Conventions

Consistency in identifier naming is one of the pillars of clean code architecture and maintainable software. In this project, a strict multi-tier naming convention strategy has been applied across all software layers:

| Layer / Construct | Target Convention | Example from Project | Rationale |
| :--- | :--- | :--- | :--- |
| **JavaScript Variables** | `camelCase` | `employeeId`, `basicSalary`, `overtimeHours`, `netSalary` | ECMAScript standard practice for variables and object properties. |
| **JavaScript Functions** | `camelCase` | `calculateNetSalary()`, `renderEmployeeTable()`, `openPayslipModal()` | Expressive verb-noun style; distinguishes functions from classes. |
| **JavaScript Classes** | `PascalCase` | `Employee`, `PayrollCalculator`, `PayrollBreakdown`, `StorageManager` | OOP convention signifying instantiable blueprints/types. |
| **JavaScript Constants** | `UPPER_SNAKE_CASE` | `DEFAULT_MONTH_WORKING_DAYS`, `HRA_PERCENTAGE`, `LOCAL_STORAGE_KEY` | Indicates immutable compile-time or application-level configurations. |
| **Database Tables** | `snake_case` | `employee_records`, `payroll_transactions`, `departments` | SQL ANSI standard across MySQL, SQLite, and PostgreSQL. |
| **Database Columns** | `snake_case` | `employee_id`, `employee_name`, `basic_salary`, `working_days` | Case-insensitive database engines safely distinguish words with underscores. |
| **HTML Element IDs** | `kebab-case` | `id="employee-form"`, `id="search-input"`, `id="payslip-modal"` | W3C CSS / HTML ID standard; clearly identifies DOM node hierarchy. |
| **CSS Classes** | `kebab-case` | `class="stat-card"`, `class="btn-primary"`, `class="modal-dialog"` | BEM / utility CSS standard; ensures readability and parser efficiency. |

---

## 2. In-Depth Convention Breakdown with Code References

### A. Variables & Properties (`camelCase`)
Variables begin with a lowercase letter and capitalize the first letter of each subsequent concatenated word. They are descriptive nouns representing state.

```javascript
// Located in js/models.js and js/app.js
let employeeId = 'EMP-1001';
let employeeName = 'Aarav Sharma';
let department = 'Engineering';
let designation = 'Senior Software Engineer';
let basicSalary = 65000;
let workingDays = 30;
let overtimeHours = 12;
let grossSalary = 92075.00;
let netSalary = 81971.25;
```

---

### B. Functions & Methods (`camelCase`)
Functions represent actions and operations. Each function name begins with an active verb (`calculate`, `render`, `handle`, `get`, `open`, `close`, `delete`) followed by the target subject.

```javascript
// Located in js/models.js and js/app.js
function calculateBasicPay(basicSalary, workingDays) { ... }
function calculateOvertimePay(basicSalary, overtimeHours) { ... }
function calculateAllowances(basicPay) { ... }
function calculateDeductions(basicPay, grossSalary) { ... }
function calculateNetSalary() { ... }
function renderEmployeeTable(recordsToDisplay) { ... }
function handleEmployeeFormSubmit(event) { ... }
```

---

### C. Classes & Types (`PascalCase`)
Classes represent domain concepts and constructors. Every word begins with an uppercase letter.

```javascript
// Located in js/models.js and js/storage.js
export class Employee { ... }
export class PayrollBreakdown { ... }
export class PayrollCalculator { ... }
export class StorageManager { ... }
```

---

### D. Constants (`UPPER_SNAKE_CASE`)
Constants are values that remain fixed throughout execution. All characters are uppercase, separated by underscores.

```javascript
// Located in js/constants.js
export const DEFAULT_MONTH_WORKING_DAYS = 30;
export const STANDARD_HOURS_PER_DAY = 8;
export const OVERTIME_PAY_MULTIPLIER = 1.5;
export const HRA_PERCENTAGE = 0.20;
export const DA_PERCENTAGE = 0.10;
export const PROVIDENT_FUND_PERCENTAGE = 0.12;
export const LOCAL_STORAGE_KEY = 'employee_payroll_records_v1';
```

---

### E. Relational Database Schema (`snake_case`)
Database entities (tables, views, foreign keys) and attributes (columns) use lowercase words separated by single underscores.

```sql
-- Located in database/schema.sql
CREATE TABLE employee_records (
    employee_id VARCHAR(20) PRIMARY KEY,
    employee_name VARCHAR(100) NOT NULL,
    department_id VARCHAR(10) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    basic_salary DECIMAL(10, 2) NOT NULL,
    working_days INT NOT NULL DEFAULT 30,
    overtime_hours DECIMAL(5, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### F. HTML Document Object Model & CSS Selectors (`kebab-case`)
HTML elements and CSS stylesheets use hyphenated lowercase words.

```html
<!-- Located in index.html -->
<section id="dashboard-view" class="view-section active">
  <div class="stat-card">
    <span class="stat-label">Total Employees</span>
    <h3 id="stat-total-employees" class="stat-value">0</h3>
  </div>
  <form id="employee-form" class="employee-form">
    <input id="input-basic-salary" class="form-control" type="number">
    <button id="save-employee-btn" class="btn btn-primary" type="submit">Save</button>
  </form>
</section>
```

```css
/* Located in css/style.css */
.stat-card { ... }
.form-control:focus { ... }
.btn-primary { ... }
.modal-backdrop { ... }
```

---

## 3. Why This Matters in Professional Engineering & Academic Viva

1. **Readability:** Anyone reading the code can immediately identify whether an identifier is a class (`Employee`), a constant (`HRA_PERCENTAGE`), a function (`calculateNetSalary()`), a variable (`employeeId`), or a database column (`basic_salary`).
2. **Preventing Collision:** Eliminates name collisions between HTML IDs, JavaScript object keys, and SQL column definitions.
3. **Cross-Platform Compatibility:** Databases like MySQL and PostgreSQL have different case-sensitivity rules for identifiers on Linux vs Windows. Using `snake_case` ensures 100% portable SQL across all operating systems.
4. **Maintainability:** New developers or project evaluators can understand the data flow effortlessly without guesswork.
