"""
Employee Payroll Management System
Project Title: Employee Payroll Naming Convention

File: database/init_db.py
Description: Python script to initialize an SQLite database and execute analytical queries.
Naming Convention Rule: snake_case for Python variables, functions, and database identifiers.
"""

import sqlite3
import os

DATABASE_FILE_NAME = "employee_payroll.db"
SCHEMA_FILE_NAME = "schema.sql"

def initialize_database():
    """Initializes the SQLite database from schema.sql."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    database_path = os.path.join(current_dir, DATABASE_FILE_NAME)
    schema_path = os.path.join(current_dir, SCHEMA_FILE_NAME)

    if not os.path.exists(schema_path):
        print(f"Error: Schema file '{schema_path}' not found.")
        return

    print("=================================================================")
    print("  EMPLOYEE PAYROLL SYSTEM - DATABASE INITIALIZATION UTILITY      ")
    print("=================================================================")
    print(f"[*] Reading schema from: {schema_path}")
    with open(schema_path, "r", encoding="utf-8") as schema_file:
        sql_script = schema_file.read()

    print(f"[*] Connecting to SQLite database: {database_path}")
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    try:
        cursor.executescript(sql_script)
        connection.commit()
        print("[+] Schema and seed records created successfully!\n")

        # Verify insertion
        cursor.execute("SELECT COUNT(*) FROM employee_records;")
        employee_count = cursor.fetchone()[0]
        print(f"[+] Total Employee Records Inserted: {employee_count}\n")

        print("-----------------------------------------------------------------")
        print("  SAMPLE QUERY OUTPUT: Department-wise Payroll Summary           ")
        print("-----------------------------------------------------------------")
        summary_query = """
        SELECT 
            d.department_name,
            COUNT(er.employee_id) AS total_employees,
            ROUND(SUM(er.basic_salary), 2) AS total_basic_spend
        FROM 
            departments d
        LEFT JOIN 
            employee_records er ON d.department_id = er.department_id
        GROUP BY 
            d.department_name
        ORDER BY 
            total_basic_spend DESC;
        """
        cursor.execute(summary_query)
        rows = cursor.fetchall()
        print(f"{'Department':<20} | {'Employees':<10} | {'Total Basic Salary (INR)'}")
        print("-" * 55)
        for row in rows:
            dept_name, emp_count, basic_spend = row
            spend_formatted = f"INR {basic_spend:,.2f}" if basic_spend else "INR 0.00"
            print(f"{dept_name:<20} | {emp_count:<10} | {spend_formatted}")

        print("=================================================================")
        print(" Database initialized and verified successfully!")
        print(f" Database file location: {database_path}")
        print("=================================================================\n")

    except sqlite3.Error as database_error:
        print(f"[-] SQLite execution error: {database_error}")
    finally:
        connection.close()

if __name__ == "__main__":
    initialize_database()
