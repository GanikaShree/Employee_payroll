/**
 * Employee Payroll Management System
 * Project: Employee Payroll Naming Convention
 * 
 * File: js/models.js
 * Description: Data models and calculation engine for employee payroll.
 * Naming Convention Rules:
 *   - Classes: PascalCase
 *   - Variables & Properties: camelCase
 *   - Functions & Methods: camelCase
 */

import {
  DEFAULT_MONTH_WORKING_DAYS,
  STANDARD_HOURS_PER_DAY,
  OVERTIME_PAY_MULTIPLIER,
  HRA_PERCENTAGE,
  DA_PERCENTAGE,
  CONVEYANCE_ALLOWANCE,
  MEDICAL_ALLOWANCE,
  PROVIDENT_FUND_PERCENTAGE,
  PROFESSIONAL_TAX_AMOUNT,
  TAX_SLAB_THRESHOLD,
  INCOME_TAX_PERCENTAGE,
  APP_CURRENCY_SYMBOL,
  APP_DATE_LOCALE
} from './constants.js';

/**
 * Class representing detailed breakdown of payroll calculation.
 * Follows PascalCase for class name.
 */
export class PayrollBreakdown {
  /**
   * @param {Object} breakdownParameters
   */
  constructor({
    basicPay,
    overtimePay,
    hraAmount,
    daAmount,
    conveyanceAmount,
    medicalAmount,
    totalAllowances,
    pfDeduction,
    professionalTax,
    incomeTax,
    totalDeductions,
    grossSalary,
    netSalary
  }) {
    this.basicPay = basicPay;
    this.overtimePay = overtimePay;
    this.hraAmount = hraAmount;
    this.daAmount = daAmount;
    this.conveyanceAmount = conveyanceAmount;
    this.medicalAmount = medicalAmount;
    this.totalAllowances = totalAllowances;
    this.pfDeduction = pfDeduction;
    this.professionalTax = professionalTax;
    this.incomeTax = incomeTax;
    this.totalDeductions = totalDeductions;
    this.grossSalary = grossSalary;
    this.netSalary = netSalary;
  }
}

/**
 * Domain class representing an Employee in the payroll system.
 * Follows PascalCase for class name.
 */
export class Employee {
  /**
   * @param {Object} employeeData
   */
  constructor({
    employeeId,
    employeeName,
    department,
    designation,
    basicSalary,
    workingDays,
    overtimeHours,
    payrollBreakdown = null,
    createdAt = new Date().toISOString()
  }) {
    // Basic employee profile details (camelCase variables)
    this.employeeId = employeeId;
    this.employeeName = employeeName;
    this.department = department;
    this.designation = designation;
    this.basicSalary = Number(basicSalary);
    this.workingDays = Number(workingDays);
    this.overtimeHours = Number(overtimeHours);
    this.createdAt = createdAt;

    // Automatic payroll computation if not pre-calculated
    this.payrollBreakdown = payrollBreakdown || PayrollCalculator.calculatePayroll(
      this.basicSalary,
      this.workingDays,
      this.overtimeHours
    );
  }

  /**
   * Recalculates the payroll breakdown based on current attributes.
   */
  recalculatePayroll() {
    this.payrollBreakdown = PayrollCalculator.calculatePayroll(
      this.basicSalary,
      this.workingDays,
      this.overtimeHours
    );
  }
}

/**
 * Service class containing pure static calculation functions.
 * Follows PascalCase for class name and camelCase for methods.
 */
export class PayrollCalculator {
  /**
   * Calculates proportional basic pay based on working days attended.
   * Formula: (basicSalary / 30) * workingDays
   * 
   * @param {number} basicSalary - Monthly agreed basic salary
   * @param {number} workingDays - Days employee worked during the month
   * @returns {number} Calculated basic pay
   */
  static calculateBasicPay(basicSalary, workingDays) {
    const dailyRate = basicSalary / DEFAULT_MONTH_WORKING_DAYS;
    const computedBasicPay = dailyRate * workingDays;
    return Number(computedBasicPay.toFixed(2));
  }

  /**
   * Calculates overtime compensation.
   * Formula: overtimeHours * hourlyRate * 1.5
   * 
   * @param {number} basicSalary - Monthly basic salary
   * @param {number} overtimeHours - Overtime hours worked
   * @returns {number} Calculated overtime pay
   */
  static calculateOvertimePay(basicSalary, overtimeHours) {
    if (overtimeHours <= 0) return 0;
    const standardDailyPay = basicSalary / DEFAULT_MONTH_WORKING_DAYS;
    const standardHourlyRate = standardDailyPay / STANDARD_HOURS_PER_DAY;
    const overtimeHourlyRate = standardHourlyRate * OVERTIME_PAY_MULTIPLIER;
    const totalOvertimePay = overtimeHours * overtimeHourlyRate;
    return Number(totalOvertimePay.toFixed(2));
  }

  /**
   * Calculates total allowances (HRA, DA, Conveyance, Medical).
   * 
   * @param {number} basicPay - Computed basic pay
   * @returns {Object} Allowance components and total
   */
  static calculateAllowances(basicPay) {
    const hraAmount = Number((basicPay * HRA_PERCENTAGE).toFixed(2));
    const daAmount = Number((basicPay * DA_PERCENTAGE).toFixed(2));
    const conveyanceAmount = CONVEYANCE_ALLOWANCE;
    const medicalAmount = MEDICAL_ALLOWANCE;
    const totalAllowances = Number((hraAmount + daAmount + conveyanceAmount + medicalAmount).toFixed(2));

    return {
      hraAmount,
      daAmount,
      conveyanceAmount,
      medicalAmount,
      totalAllowances
    };
  }

  /**
   * Calculates total deductions (Provident Fund, Professional Tax, TDS/Income Tax).
   * 
   * @param {number} basicPay - Computed basic pay
   * @param {number} grossSalary - Total gross earnings before deductions
   * @returns {Object} Deduction components and total
   */
  static calculateDeductions(basicPay, grossSalary) {
    const pfDeduction = Number((basicPay * PROVIDENT_FUND_PERCENTAGE).toFixed(2));
    const professionalTax = PROFESSIONAL_TAX_AMOUNT;
    
    // Income tax calculated if gross salary exceeds statutory threshold
    let incomeTax = 0;
    if (grossSalary > TAX_SLAB_THRESHOLD) {
      const taxableExcess = grossSalary - TAX_SLAB_THRESHOLD;
      incomeTax = Number((taxableExcess * INCOME_TAX_PERCENTAGE).toFixed(2));
    }

    const totalDeductions = Number((pfDeduction + professionalTax + incomeTax).toFixed(2));

    return {
      pfDeduction,
      professionalTax,
      incomeTax,
      totalDeductions
    };
  }

  /**
   * Primary entry point: Computes full payroll breakdown and net salary.
   * Net Salary = Gross Salary - Total Deductions
   * Gross Salary = Basic Pay + Overtime Pay + Total Allowances
   * 
   * @param {number} basicSalary 
   * @param {number} workingDays 
   * @param {number} overtimeHours 
   * @returns {PayrollBreakdown} Complete payroll breakdown object
   */
  static calculatePayroll(basicSalary, workingDays, overtimeHours) {
    const basicPay = this.calculateBasicPay(basicSalary, workingDays);
    const overtimePay = this.calculateOvertimePay(basicSalary, overtimeHours);
    const allowances = this.calculateAllowances(basicPay);

    const grossSalary = Number((basicPay + overtimePay + allowances.totalAllowances).toFixed(2));
    const deductions = this.calculateDeductions(basicPay, grossSalary);

    const netSalary = Number((grossSalary - deductions.totalDeductions).toFixed(2));

    return new PayrollBreakdown({
      basicPay,
      overtimePay,
      hraAmount: allowances.hraAmount,
      daAmount: allowances.daAmount,
      conveyanceAmount: allowances.conveyanceAmount,
      medicalAmount: allowances.medicalAmount,
      totalAllowances: allowances.totalAllowances,
      pfDeduction: deductions.pfDeduction,
      professionalTax: deductions.professionalTax,
      incomeTax: deductions.incomeTax,
      totalDeductions: deductions.totalDeductions,
      grossSalary,
      netSalary
    });
  }

  /**
   * Helper utility to format numerical currency into INR standard string.
   * 
   * @param {number} amount 
   * @returns {string} Formatted currency string (e.g., ₹45,200.00)
   */
  static formatCurrency(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return `${APP_CURRENCY_SYMBOL}0.00`;
    }
    return `${APP_CURRENCY_SYMBOL}${Number(amount).toLocaleString(APP_DATE_LOCALE, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}
