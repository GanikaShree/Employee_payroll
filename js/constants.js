/**
 * Employee Payroll Management System
 * Project: Employee Payroll Naming Convention
 * 
 * File: js/constants.js
 * Description: Contains all global application constants.
 * Naming Convention Rule: UPPER_SNAKE_CASE for constants.
 */

// Payroll calculation constants
export const DEFAULT_MONTH_WORKING_DAYS = 30;
export const STANDARD_HOURS_PER_DAY = 8;
export const OVERTIME_PAY_MULTIPLIER = 1.5;

// Allowance percentages and fixed amounts
export const HRA_PERCENTAGE = 0.20; // 20% House Rent Allowance based on basic pay
export const DA_PERCENTAGE = 0.10;  // 10% Dearness Allowance based on basic pay
export const CONVEYANCE_ALLOWANCE = 1200; // Fixed conveyance allowance in INR
export const MEDICAL_ALLOWANCE = 1500;    // Fixed medical allowance in INR

// Deduction percentages and fixed amounts
export const PROVIDENT_FUND_PERCENTAGE = 0.12; // 12% PF contribution
export const PROFESSIONAL_TAX_AMOUNT = 200;    // Fixed professional tax
export const TAX_SLAB_THRESHOLD = 50000;       // Taxable threshold for basic pay
export const INCOME_TAX_PERCENTAGE = 0.05;     // 5% tax on amount above threshold

// Storage and system constants
export const LOCAL_STORAGE_KEY = 'employee_payroll_records_v2';
export const APP_CURRENCY_SYMBOL = '₹';
export const APP_DATE_LOCALE = 'en-IN';

// Authentication constants
export const DEFAULT_ADMIN_USERNAME = 'Ganika';
export const DEFAULT_ADMIN_PASSWORD = 'Ganika@123';
export const AUTH_SESSION_STORAGE_KEY = 'employee_payroll_auth_session_v1';
export const REGISTERED_USERS_STORAGE_KEY = 'employee_payroll_registered_users_v1';
