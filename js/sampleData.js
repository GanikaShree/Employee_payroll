/**
 * Employee Payroll Management System
 * Project: Employee Payroll Naming Convention
 * 
 * File: js/sampleData.js
 * Description: Preloaded sample employee records for demonstration and viva testing.
 * Naming Convention Rule: camelCase for sample data objects and arrays.
 */

import { Employee } from './models.js';

/**
 * Array of sample employees formatted with realistic B.Tech project test cases.
 */
export const initialEmployeeRecords = [
  new Employee({
    employeeId: 'EMP-001',
    employeeName: 'Aarav Sharma',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    basicSalary: 65000,
    workingDays: 30,
    overtimeHours: 12
  }),
  new Employee({
    employeeId: 'EMP-002',
    employeeName: 'Priya Venkatesh',
    department: 'Human Resources',
    designation: 'HR Operations Lead',
    basicSalary: 48000,
    workingDays: 29,
    overtimeHours: 0
  }),
  new Employee({
    employeeId: 'EMP-003',
    employeeName: 'Rohan Deshmukh',
    department: 'Finance',
    designation: 'Financial Analyst',
    basicSalary: 52000,
    workingDays: 28,
    overtimeHours: 6
  }),
  new Employee({
    employeeId: 'EMP-004',
    employeeName: 'Ananya Sen',
    department: 'Engineering',
    designation: 'Frontend Developer',
    basicSalary: 42000,
    workingDays: 30,
    overtimeHours: 15
  }),
  new Employee({
    employeeId: 'EMP-005',
    employeeName: 'Vikramaditya Nair',
    department: 'Operations',
    designation: 'Operations Executive',
    basicSalary: 35000,
    workingDays: 26,
    overtimeHours: 8
  }),
  new Employee({
    employeeId: 'EMP-006',
    employeeName: 'Sneha Kulkarni',
    department: 'Quality Assurance',
    designation: 'QA Automation Engineer',
    basicSalary: 45000,
    workingDays: 30,
    overtimeHours: 4
  })
];
