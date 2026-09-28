/**
 * Employee Payroll Management System
 * Project: Employee Payroll Naming Convention
 * 
 * File: js/storage.js
 * Description: Handles data persistence in browser LocalStorage.
 * Naming Convention Rules:
 *   - Class: PascalCase (StorageManager)
 *   - Methods & Variables: camelCase
 *   - Constants: UPPER_SNAKE_CASE
 */

import { 
  LOCAL_STORAGE_KEY, 
  REGISTERED_USERS_STORAGE_KEY, 
  DEFAULT_ADMIN_USERNAME, 
  DEFAULT_ADMIN_PASSWORD 
} from './constants.js';
import { Employee } from './models.js';
import { initialEmployeeRecords } from './sampleData.js';

export class StorageManager {
  /**
   * Initializes local storage with sample records and default registered admin if empty.
   */
  static initializeStorage() {
    const existingData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!existingData) {
      this.resetToSampleData();
    }
    this.initializeRegisteredUsers();
  }

  /**
   * Retrieves all employee records from LocalStorage.
   * Rehydrates raw plain objects into rich Employee model instances.
   * 
   * @returns {Array<Employee>} List of employee instances
   */
  static getAllEmployees() {
    try {
      const serializedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!serializedData) {
        return [];
      }
      const parsedRecords = JSON.parse(serializedData);
      return parsedRecords.map(record => new Employee(record));
    } catch (storageError) {
      console.error('Failed to parse employee records from LocalStorage:', storageError);
      return [];
    }
  }

  /**
   * Finds an individual employee by their unique employeeId.
   * 
   * @param {string} employeeId 
   * @returns {Employee|null}
   */
  static getEmployeeById(employeeId) {
    const employeeList = this.getAllEmployees();
    const matchedEmployee = employeeList.find(
      emp => emp.employeeId.trim().toUpperCase() === employeeId.trim().toUpperCase()
    );
    return matchedEmployee || null;
  }

  /**
   * Saves a new employee record.
   * Checks for duplicate employee IDs.
   * 
   * @param {Employee} newEmployee 
   * @returns {{ success: boolean, message: string }}
   */
  static addEmployee(newEmployee) {
    const employeeList = this.getAllEmployees();
    
    // Check for ID collision
    const existingEmployee = employeeList.find(
      emp => emp.employeeId.trim().toUpperCase() === newEmployee.employeeId.trim().toUpperCase()
    );

    if (existingEmployee) {
      return {
        success: false,
        message: `Employee with ID '${newEmployee.employeeId}' already exists.`
      };
    }

    employeeList.push(newEmployee);
    this.commitToStorage(employeeList);

    return {
      success: true,
      message: `Employee '${newEmployee.employeeName}' added successfully.`
    };
  }

  /**
   * Updates an existing employee record.
   * 
   * @param {string} originalEmployeeId 
   * @param {Employee} updatedEmployee 
   * @returns {{ success: boolean, message: string }}
   */
  static updateEmployee(originalEmployeeId, updatedEmployee) {
    const employeeList = this.getAllEmployees();
    const targetIndex = employeeList.findIndex(
      emp => emp.employeeId.trim().toUpperCase() === originalEmployeeId.trim().toUpperCase()
    );

    if (targetIndex === -1) {
      return {
        success: false,
        message: `Employee ID '${originalEmployeeId}' not found for update.`
      };
    }

    // Check if ID was changed to another existing employee's ID
    if (originalEmployeeId.toUpperCase() !== updatedEmployee.employeeId.toUpperCase()) {
      const duplicateCheck = employeeList.find(
        (emp, index) => index !== targetIndex && emp.employeeId.toUpperCase() === updatedEmployee.employeeId.toUpperCase()
      );
      if (duplicateCheck) {
        return {
          success: false,
          message: `Cannot update: New ID '${updatedEmployee.employeeId}' is already in use.`
        };
      }
    }

    employeeList[targetIndex] = updatedEmployee;
    this.commitToStorage(employeeList);

    return {
      success: true,
      message: `Employee '${updatedEmployee.employeeName}' updated successfully.`
    };
  }

  /**
   * Automatically re-sequences employee IDs after a deletion so there are no numbering gaps.
   * If Employee 2 is deleted, Employee 3 becomes Employee 2, Employee 4 becomes Employee 3, etc.
   * 
   * @param {Array<Employee>} employeeList - List of remaining employees
   * @param {number} deletedIndex - The index where deletion occurred
   * @returns {Array<Employee>} Re-sequenced employee list
   */
  static resequenceEmployeeIds(employeeList, deletedIndex) {
    if (!employeeList || employeeList.length === 0 || deletedIndex >= employeeList.length) {
      return employeeList;
    }

    for (let i = deletedIndex; i < employeeList.length; i++) {
      const currentEmployee = employeeList[i];
      const match = currentEmployee.employeeId.match(/^([A-Za-z_-]*)(\d+)$/);
      
      if (match) {
        const prefix = match[1]; // e.g. 'EMP-' or ''
        const numericPart = match[2]; // e.g. '003' or '1003' or '3'
        const paddingLength = numericPart.length;
        const currentNum = parseInt(numericPart, 10);
        
        // Decrement by 1 to shift into the previous deleted slot
        const newNum = currentNum - 1;
        const updatedId = `${prefix}${String(newNum).padStart(paddingLength, '0')}`;
        
        currentEmployee.employeeId = updatedId;
      }
    }

    return employeeList;
  }

  /**
   * Deletes an employee by their employeeId and automatically shifts subsequent IDs down.
   * 
   * @param {string} employeeId 
   * @returns {{ success: boolean, message: string }}
   */
  static deleteEmployee(employeeId) {
    const employeeList = this.getAllEmployees();
    const targetIndex = employeeList.findIndex(
      emp => emp.employeeId.trim().toUpperCase() === employeeId.trim().toUpperCase()
    );

    if (targetIndex === -1) {
      return {
        success: false,
        message: `Employee ID '${employeeId}' was not found.`
      };
    }

    // Remove the employee at targetIndex
    employeeList.splice(targetIndex, 1);

    // Automatically re-sequence subsequent employee IDs so there are no gaps
    this.resequenceEmployeeIds(employeeList, targetIndex);

    this.commitToStorage(employeeList);
    return {
      success: true,
      message: `Employee ID '${employeeId}' deleted. Subsequent employee IDs updated automatically.`
    };
  }

  /**
   * Initializes registered users storage with default administrator.
   */
  static initializeRegisteredUsers() {
    const existingUsers = localStorage.getItem(REGISTERED_USERS_STORAGE_KEY);
    if (!existingUsers) {
      const defaultUsers = [
        {
          username: DEFAULT_ADMIN_USERNAME,
          password: DEFAULT_ADMIN_PASSWORD,
          fullName: 'Ganika',
          role: 'Payroll Officer',
          email: 'ganika@payroll.edu',
          registeredAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    }
  }

  /**
   * Retrieves all registered user accounts from LocalStorage.
   * 
   * @returns {Array<Object>} List of registered users
   */
  static getRegisteredUsers() {
    this.initializeRegisteredUsers();
    try {
      const serializedUsers = localStorage.getItem(REGISTERED_USERS_STORAGE_KEY);
      let users = serializedUsers ? JSON.parse(serializedUsers) : [];
      if (!Array.isArray(users)) users = [];

      // Ensure default admin Ganika is always available
      const hasAdmin = users.some(
        u => (u.username || '').toLowerCase() === DEFAULT_ADMIN_USERNAME.toLowerCase()
      );
      if (!hasAdmin) {
        users.unshift({
          username: DEFAULT_ADMIN_USERNAME,
          password: DEFAULT_ADMIN_PASSWORD,
          fullName: 'Ganika',
          role: 'Payroll Officer',
          email: 'ganika@payroll.edu',
          registeredAt: new Date().toISOString()
        });
        localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(users));
      }

      return users;
    } catch (parseError) {
      console.error('Failed to parse registered users:', parseError);
      return [
        {
          username: DEFAULT_ADMIN_USERNAME,
          password: DEFAULT_ADMIN_PASSWORD,
          fullName: 'Ganika',
          role: 'Payroll Officer',
          email: 'ganika@payroll.edu',
          registeredAt: new Date().toISOString()
        }
      ];
    }
  }

  /**
   * Registers a new user account.
   * 
   * @param {Object} newUser 
   * @returns {{ success: boolean, user?: Object, message: string }}
   */
  static registerUser(newUser) {
    const userList = this.getRegisteredUsers();
    const cleanUsername = (newUser.username || '').trim();
    const cleanPassword = (newUser.password || '').trim();

    if (!cleanUsername) {
      return {
        success: false,
        message: 'Username cannot be empty.'
      };
    }

    if (!cleanPassword || cleanPassword.length < 3) {
      return {
        success: false,
        message: 'Password must be at least 3 characters long.'
      };
    }
    
    // Check if username already exists (case-insensitive)
    const duplicateUser = userList.find(
      u => (u.username || '').trim().toLowerCase() === cleanUsername.toLowerCase()
    );

    if (duplicateUser) {
      return {
        success: false,
        message: `Username '${cleanUsername}' is already taken. Please choose another username.`
      };
    }

    const formattedFullName = newUser.fullName && newUser.fullName.trim()
      ? newUser.fullName.trim()
      : (cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1));

    const userRecord = {
      username: cleanUsername,
      password: cleanPassword,
      fullName: formattedFullName,
      role: newUser.role || 'Payroll Officer',
      email: newUser.email ? newUser.email.trim() : '',
      registeredAt: new Date().toISOString()
    };

    userList.push(userRecord);
    localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(userList));

    return {
      success: true,
      user: userRecord,
      message: `Account '${cleanUsername}' created successfully! You can now sign in with this username.`
    };
  }

  /**
   * Authenticates username and password against registered users.
   * 
   * @param {string} username 
   * @param {string} password 
   * @returns {{ success: boolean, user: Object|null, message: string }}
   */
  static authenticateUser(username, password) {
    const userList = this.getRegisteredUsers();
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    
    const matchedUser = userList.find(
      u => (u.username || '').trim().toLowerCase() === cleanUsername && 
           (u.password || '').trim() === cleanPassword
    );

    if (matchedUser) {
      return {
        success: true,
        user: matchedUser,
        message: `Welcome back, ${matchedUser.fullName || matchedUser.username}!`
      };
    }

    return {
      success: false,
      user: null,
      message: 'Invalid username or password.'
    };
  }

  /**
   * Overwrites stored records with fresh sample data.
   */
  static resetToSampleData() {
    this.commitToStorage(initialEmployeeRecords);
  }

  /**
   * Helper function to serialize and persist list to LocalStorage.
   * 
   * @param {Array<Employee>} records 
   */
  static commitToStorage(records) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  }
}
