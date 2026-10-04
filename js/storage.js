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
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_VIEWER_USERNAME,
  DEFAULT_VIEWER_PASSWORD
} from './constants.js';
import { Employee } from './models.js';
import { initialEmployeeRecords } from './sampleData.js';

export class StorageManager {
  /**
   * Initializes local storage with sample records and default registered admin if empty.
   * Also purges legacy login history and previous sessions.
   */
  static initializeStorage() {
    this.purgeLegacyLoginHistory();

    const existingData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!existingData) {
      this.resetToSampleData();
    }
    this.initializeRegisteredUsers();
  }

  /**
   * Permanently clears all previous login history, saved sessions, and old user records.
   */
  static purgeLegacyLoginHistory() {
    const legacySessionKeys = [
      'employee_payroll_auth_session_v1',
      'employee_payroll_auth_session_v2',
      'employee_payroll_registered_users_v1',
      'employee_payroll_registered_users_v2',
      'current_user',
      'logged_in_user',
      'auth_session'
    ];

    legacySessionKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch (err) {
        // ignore
      }
    });

    // Run one-time session purge for v3 so existing browser sessions are reset cleanly
    const migrationPurgeFlag = 'employee_payroll_history_purged_v3';
    if (!localStorage.getItem(migrationPurgeFlag)) {
      try {
        localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
        localStorage.setItem(migrationPurgeFlag, 'true');
      } catch (err) {
        // ignore
      }
    }
  }

  /**
   * Explicitly clears all stored login history, active sessions, and resets user accounts.
   * 
   * @returns {{ success: boolean, message: string }}
   */
  static clearAllLoginHistory() {
    try {
      localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      localStorage.removeItem('employee_payroll_auth_session_v1');
      localStorage.removeItem('employee_payroll_auth_session_v2');
      sessionStorage.removeItem('employee_payroll_auth_session_v1');
      sessionStorage.removeItem('employee_payroll_auth_session_v2');

      const defaultCleanUsers = [
        {
          username: DEFAULT_ADMIN_USERNAME,
          password: DEFAULT_ADMIN_PASSWORD,
          fullName: 'System Administrator',
          role: 'Administrator (Full Access)',
          isAdmin: true,
          email: 'admin@payroll.edu',
          registeredAt: new Date().toISOString()
        },
        {
          username: DEFAULT_VIEWER_USERNAME,
          password: DEFAULT_VIEWER_PASSWORD,
          fullName: 'Demo Staff Viewer',
          role: 'Staff Member (Read-Only)',
          isAdmin: false,
          email: 'viewer@payroll.edu',
          registeredAt: new Date().toISOString()
        }
      ];

      localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(defaultCleanUsers));
      return {
        success: true,
        message: 'All login history and saved sessions have been cleared successfully.'
      };
    } catch (error) {
      console.error('Failed to clear login history:', error);
      return {
        success: false,
        message: 'Failed to clear login history.'
      };
    }
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
   * Initializes registered users storage with default administrator and demo viewer.
   */
  static initializeRegisteredUsers() {
    const existingUsers = localStorage.getItem(REGISTERED_USERS_STORAGE_KEY);
    if (!existingUsers) {
      const defaultUsers = [
        {
          username: DEFAULT_ADMIN_USERNAME,
          password: DEFAULT_ADMIN_PASSWORD,
          fullName: 'System Administrator',
          role: 'Administrator (Full Access)',
          isAdmin: true,
          email: 'admin@payroll.edu',
          registeredAt: new Date().toISOString()
        },
        {
          username: DEFAULT_VIEWER_USERNAME,
          password: DEFAULT_VIEWER_PASSWORD,
          fullName: 'Demo Staff Viewer',
          role: 'Staff Member (Read-Only)',
          isAdmin: false,
          email: 'viewer@payroll.edu',
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

      // Ensure default admin 'Admin' is always available and has isAdmin: true
      const adminIndex = users.findIndex(
        u => (u.username || '').trim().toLowerCase() === DEFAULT_ADMIN_USERNAME.toLowerCase()
      );
      if (adminIndex === -1) {
        users.unshift({
          username: DEFAULT_ADMIN_USERNAME,
          password: DEFAULT_ADMIN_PASSWORD,
          fullName: 'System Administrator',
          role: 'Administrator (Full Access)',
          isAdmin: true,
          email: 'admin@payroll.edu',
          registeredAt: new Date().toISOString()
        });
      } else {
        // Enforce updated credentials and admin privileges on Admin
        users[adminIndex].username = DEFAULT_ADMIN_USERNAME;
        users[adminIndex].password = DEFAULT_ADMIN_PASSWORD;
        users[adminIndex].fullName = 'System Administrator';
        users[adminIndex].isAdmin = true;
        users[adminIndex].role = 'Administrator (Full Access)';
      }

      // Ensure demo viewer is present
      const hasViewer = users.some(
        u => (u.username || '').trim().toLowerCase() === DEFAULT_VIEWER_USERNAME.toLowerCase()
      );
      if (!hasViewer) {
        users.push({
          username: DEFAULT_VIEWER_USERNAME,
          password: DEFAULT_VIEWER_PASSWORD,
          fullName: 'Demo Staff Viewer',
          role: 'Staff Member (Read-Only)',
          isAdmin: false,
          email: 'viewer@payroll.edu',
          registeredAt: new Date().toISOString()
        });
      }

      // Guarantee ONLY 'Admin' has isAdmin = true; any and all other logins are strictly isAdmin = false (read-only reference)
      users.forEach(u => {
        if ((u.username || '').trim().toLowerCase() !== DEFAULT_ADMIN_USERNAME.toLowerCase()) {
          u.isAdmin = false;
        } else {
          u.isAdmin = true;
          u.password = DEFAULT_ADMIN_PASSWORD;
        }
      });

      localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(users));
      return users;
    } catch (parseError) {
      console.error('Failed to parse registered users:', parseError);
      return [
        {
          username: DEFAULT_ADMIN_USERNAME,
          password: DEFAULT_ADMIN_PASSWORD,
          fullName: 'System Administrator',
          role: 'Administrator (Full Access)',
          isAdmin: true,
          email: 'admin@payroll.edu',
          registeredAt: new Date().toISOString()
        },
        {
          username: DEFAULT_VIEWER_USERNAME,
          password: DEFAULT_VIEWER_PASSWORD,
          fullName: 'Demo Staff Viewer',
          role: 'Staff Member (Read-Only)',
          isAdmin: false,
          email: 'viewer@payroll.edu',
          registeredAt: new Date().toISOString()
        }
      ];
    }
  }

  /**
   * Registers a new user account.
   * All user accounts created via registration have read-only permissions (isAdmin: false).
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
      role: newUser.role || 'Staff Member (Read-Only)',
      isAdmin: false, // Registered users are strictly read-only
      email: newUser.email ? newUser.email.trim() : '',
      registeredAt: new Date().toISOString()
    };

    userList.push(userRecord);
    localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(userList));

    return {
      success: true,
      user: userRecord,
      message: `Account '${cleanUsername}' created successfully with Read-Only and Report Download access.`
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
