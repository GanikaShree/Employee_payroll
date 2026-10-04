/**
 * Employee Payroll Management System
 * Project: Employee Payroll Naming Convention
 * 
 * File: js/app.js
 * Description: Main user interface controller and event orchestration.
 * Naming Convention Rules:
 *   - Variables & Properties: camelCase
 *   - Functions & Methods: camelCase
 *   - Classes: PascalCase
 *   - Constants: UPPER_SNAKE_CASE
 *   - DOM Selectors: kebab-case
 */

import { Employee, PayrollCalculator } from './models.js';
import { StorageManager } from './storage.js';
import { 
  DEFAULT_ADMIN_USERNAME, 
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_VIEWER_USERNAME,
  DEFAULT_VIEWER_PASSWORD, 
  AUTH_SESSION_STORAGE_KEY 
} from './constants.js';

// Global application state variables (camelCase)
let currentEmployeeRecords = [];
let pendingDeleteEmployeeId = null;

/**
 * Checks whether the currently logged-in session has Administrator editing privileges.
 * ONLY the account 'Admin' has full editing access (Add, Edit, Delete, Reset).
 * The 'Ganika' login and all other logins DO NOT have editing access (Strictly Read-Only Reference).
 * 
 * @returns {boolean} True if current user is Admin, false if Read-Only
 */
function isCurrentUserAdmin() {
  const sessionUser = sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY) || 
                      localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!sessionUser) return false;

  const cleanUsername = sessionUser.trim().toLowerCase();

  // Explicit policy: Ganika login does NOT have editing access
  if (cleanUsername === 'ganika') {
    return false;
  }

  // ONLY 'Admin' has editing access
  if (cleanUsername === DEFAULT_ADMIN_USERNAME.toLowerCase()) {
    return true;
  }

  return false;
}


/**
 * Initializes the payroll application on DOM load.
 * Sets up storage, renders data, and attaches all event handlers.
 */
function initializePayrollApp() {
  console.log('Initializing Employee Payroll Management System...');

  // Initialize storage with sample data if first time
  StorageManager.initializeStorage();

  // Attach all user interaction event listeners
  setupEventListeners();

  // Check authentication status and render appropriate view
  checkAuthenticationState();

  console.log('Payroll Application Initialized Successfully.');
}

/**
 * Reloads employee records from LocalStorage into the runtime array.
 */
function refreshEmployeeData() {
  currentEmployeeRecords = StorageManager.getAllEmployees();
}

/**
 * Renders both the summary statistics and the employee table.
 */
function renderDashboard() {
  const filteredRecords = getFilteredAndSortedRecords();
  renderSummaryStats(currentEmployeeRecords);
  renderEmployeeTable(filteredRecords);
}

/**
 * Computes and renders top metric cards.
 * 
 * @param {Array<Employee>} employeeList 
 */
function renderSummaryStats(employeeList) {
  const statTotalEmployees = document.getElementById('stat-total-employees');
  const statTotalNetPayout = document.getElementById('stat-total-net-payout');
  const statAvgNetSalary = document.getElementById('stat-avg-net-salary');
  const statTotalOvertimeHours = document.getElementById('stat-total-overtime-hours');

  const totalEmployeesCount = employeeList.length;

  let totalPayrollSpend = 0;
  let totalOvertimeHoursAccumulated = 0;

  employeeList.forEach(employee => {
    totalPayrollSpend += employee.payrollBreakdown.netSalary;
    totalOvertimeHoursAccumulated += employee.overtimeHours;
  });

  const averageNetSalary = totalEmployeesCount > 0 
    ? totalPayrollSpend / totalEmployeesCount 
    : 0;

  statTotalEmployees.textContent = totalEmployeesCount.toString();
  statTotalNetPayout.textContent = PayrollCalculator.formatCurrency(totalPayrollSpend);
  statAvgNetSalary.textContent = PayrollCalculator.formatCurrency(averageNetSalary);
  statTotalOvertimeHours.textContent = `${totalOvertimeHoursAccumulated} hrs`;
}

/**
 * Filters and sorts employee records based on user search and dropdown inputs.
 * 
 * @returns {Array<Employee>}
 */
function getFilteredAndSortedRecords() {
  const searchInput = document.getElementById('search-input');
  const departmentFilter = document.getElementById('department-filter');
  const sortSelector = document.getElementById('sort-selector');

  const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedDepartment = departmentFilter ? departmentFilter.value : 'ALL';
  const selectedSortOrder = sortSelector ? sortSelector.value : 'id-asc';

  // Filter phase
  let filteredList = currentEmployeeRecords.filter(employee => {
    const matchesQuery = 
      employee.employeeId.toLowerCase().includes(searchQuery) ||
      employee.employeeName.toLowerCase().includes(searchQuery);

    const matchesDepartment = 
      selectedDepartment === 'ALL' || 
      employee.department === selectedDepartment;

    return matchesQuery && matchesDepartment;
  });

  // Sort phase
  filteredList.sort((employeeA, employeeB) => {
    switch (selectedSortOrder) {
      case 'name-asc':
        return employeeA.employeeName.localeCompare(employeeB.employeeName);
      case 'salary-desc':
        return employeeB.payrollBreakdown.netSalary - employeeA.payrollBreakdown.netSalary;
      case 'salary-asc':
        return employeeA.payrollBreakdown.netSalary - employeeB.payrollBreakdown.netSalary;
      case 'id-asc':
      default:
        return employeeA.employeeId.localeCompare(employeeB.employeeId);
    }
  });

  return filteredList;
}

/**
 * Renders the HTML table body with employee payroll rows.
 * 
 * @param {Array<Employee>} recordsToDisplay 
 */
function renderEmployeeTable(recordsToDisplay) {
  const tableBody = document.getElementById('payroll-table-body');
  const emptyStateContainer = document.getElementById('empty-state-container');
  const recordCounterBadge = document.getElementById('record-counter-badge');

  if (!tableBody) return;

  // Clear existing rows
  tableBody.innerHTML = '';

  recordCounterBadge.textContent = `Showing ${recordsToDisplay.length} of ${currentEmployeeRecords.length} records`;

  if (recordsToDisplay.length === 0) {
    emptyStateContainer.classList.remove('hidden');
    return;
  }

  emptyStateContainer.classList.add('hidden');

  const isAdmin = isCurrentUserAdmin();

  recordsToDisplay.forEach(employee => {
    const tableRow = document.createElement('tr');

    let actionsCellHtml = `
      <div class="action-buttons-cell">
        <button 
          type="button" 
          class="action-btn action-btn-view" 
          data-action="view-payslip" 
          data-id="${escapeHtml(employee.employeeId)}"
          title="Generate & View Salary Slip"
        >
          <i class="fa-solid fa-file-invoice"></i>
        </button>
    `;

    // Only administrators have permissions to edit or delete employee records
    if (isAdmin) {
      actionsCellHtml += `
        <button 
          type="button" 
          class="action-btn action-btn-edit" 
          data-action="edit-employee" 
          data-id="${escapeHtml(employee.employeeId)}"
          title="Edit Employee Details"
        >
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button 
          type="button" 
          class="action-btn action-btn-delete" 
          data-action="delete-employee" 
          data-id="${escapeHtml(employee.employeeId)}"
          title="Delete Employee"
        >
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;
    }

    actionsCellHtml += `</div>`;

    tableRow.innerHTML = `
      <td>
        <span class="emp-id-cell">${escapeHtml(employee.employeeId)}</span>
      </td>
      <td>
        <span class="emp-name-cell">${escapeHtml(employee.employeeName)}</span>
      </td>
      <td>
        <span class="badge-dept">${escapeHtml(employee.department)}</span>
        <span class="emp-designation-sub">${escapeHtml(employee.designation)}</span>
      </td>
      <td class="text-right font-code">
        ${PayrollCalculator.formatCurrency(employee.basicSalary)}
      </td>
      <td class="text-center font-code">
        ${employee.workingDays}
      </td>
      <td class="text-center font-code">
        ${employee.overtimeHours > 0 ? `${employee.overtimeHours}h` : '-'}
      </td>
      <td class="text-right font-code text-green">
        ${PayrollCalculator.formatCurrency(employee.payrollBreakdown.grossSalary)}
      </td>
      <td class="text-right font-code text-red">
        ${PayrollCalculator.formatCurrency(employee.payrollBreakdown.totalDeductions)}
      </td>
      <td class="text-right font-code font-bold text-highlight">
        ${PayrollCalculator.formatCurrency(employee.payrollBreakdown.netSalary)}
      </td>
      <td class="text-center">
        ${actionsCellHtml}
      </td>
    `;

    tableBody.appendChild(tableRow);
  });
}

/**
 * Updates the live payroll preview within the Add/Edit form.
 */
function updateLiveCalculationPreview() {
  const basicSalaryInput = document.getElementById('input-basic-salary');
  const workingDaysInput = document.getElementById('input-working-days');
  const overtimeHoursInput = document.getElementById('input-overtime-hours');

  const previewBasicPay = document.getElementById('preview-basic-pay');
  const previewOvertimePay = document.getElementById('preview-overtime-pay');
  const previewAllowances = document.getElementById('preview-allowances');
  const previewDeductions = document.getElementById('preview-deductions');
  const previewNetSalary = document.getElementById('preview-net-salary');

  const basicSalary = parseFloat(basicSalaryInput.value) || 0;
  const workingDays = parseFloat(workingDaysInput.value) || 0;
  const overtimeHours = parseFloat(overtimeHoursInput.value) || 0;

  if (basicSalary <= 0 || workingDays <= 0) {
    previewBasicPay.textContent = PayrollCalculator.formatCurrency(0);
    previewOvertimePay.textContent = PayrollCalculator.formatCurrency(0);
    previewAllowances.textContent = PayrollCalculator.formatCurrency(0);
    previewDeductions.textContent = PayrollCalculator.formatCurrency(0);
    previewNetSalary.textContent = PayrollCalculator.formatCurrency(0);
    return;
  }

  // Calculate live breakdown
  const liveBreakdown = PayrollCalculator.calculatePayroll(basicSalary, workingDays, overtimeHours);

  previewBasicPay.textContent = PayrollCalculator.formatCurrency(liveBreakdown.basicPay);
  previewOvertimePay.textContent = PayrollCalculator.formatCurrency(liveBreakdown.overtimePay);
  previewAllowances.textContent = `+ ${PayrollCalculator.formatCurrency(liveBreakdown.totalAllowances)}`;
  previewDeductions.textContent = `- ${PayrollCalculator.formatCurrency(liveBreakdown.totalDeductions)}`;
  previewNetSalary.textContent = PayrollCalculator.formatCurrency(liveBreakdown.netSalary);
}

/**
 * Formats a name string so that the first letter of each word is capitalized (Title Case).
 * Example: "rahul verma" -> "Rahul Verma"
 * 
 * @param {string} inputName 
 * @returns {string} Capitalized name string
 */
function formatCapitalizedName(inputName) {
  if (!inputName || typeof inputName !== 'string') return '';
  return inputName
    .split(' ')
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Checks authentication status and toggles between Login View and Dashboard.
 */
function checkAuthenticationState() {
  const sessionUser = sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY) || 
                      localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  
  const loginView = document.getElementById('login-view');
  const mainHeader = document.getElementById('main-app-header');
  const mainWrapper = document.querySelector('.main-wrapper');
  const appFooter = document.querySelector('.app-footer');
  const currentUserDisplay = document.getElementById('current-user-display');

  if (sessionUser) {
    if (loginView) loginView.classList.add('hidden');
    if (mainHeader) mainHeader.classList.remove('hidden');
    if (mainWrapper) mainWrapper.classList.remove('hidden');
    if (appFooter) appFooter.classList.remove('hidden');
    
    // Look up registered user profile to display formatted full name & role
    const registeredUsers = StorageManager.getRegisteredUsers();
    const userProfile = registeredUsers.find(
      u => u.username.toLowerCase() === sessionUser.toLowerCase()
    );
    const isAdmin = isCurrentUserAdmin();
    const displayName = userProfile ? (userProfile.fullName || userProfile.username) : sessionUser;
    
    // 1. User profile display & role badge
    if (currentUserDisplay) {
      currentUserDisplay.textContent = displayName;
    }
    const roleDisplay = document.querySelector('.user-role-text');
    const userAvatar = document.querySelector('.user-avatar-circle');
    if (roleDisplay) {
      if (isAdmin) {
        roleDisplay.innerHTML = `<span class="badge-admin-pill"><i class="fa-solid fa-shield-halved"></i> Administrator (Full Access)</span>`;
        if (userAvatar) {
          userAvatar.innerHTML = `<i class="fa-solid fa-user-shield"></i>`;
          userAvatar.title = 'Logged in as Administrator (Full Modify & Edit Privileges)';
        }
      } else {
        const userRole = userProfile ? userProfile.role : 'Staff Member (Read-Only)';
        roleDisplay.innerHTML = `<span class="badge-viewer-pill"><i class="fa-solid fa-eye"></i> ${escapeHtml(userRole)}</span>`;
        if (userAvatar) {
          userAvatar.innerHTML = `<i class="fa-solid fa-user"></i>`;
          userAvatar.title = 'Logged in as Registered User (Read & Download Report Privileges)';
        }
      }
    }

    // 2. Control visibility of Add Employee header button (Admin only)
    const addHeaderBtn = document.getElementById('add-employee-header-btn');
    if (addHeaderBtn) {
      if (isAdmin) {
        addHeaderBtn.classList.remove('hidden');
      } else {
        addHeaderBtn.classList.add('hidden');
      }
    }

    // 3. Control visibility of Reset Sample Data button (Admin only)
    const resetBtn = document.getElementById('reset-sample-data-btn');
    if (resetBtn) {
      if (isAdmin) {
        resetBtn.classList.remove('hidden');
      } else {
        resetBtn.classList.add('hidden');
      }
    }

    // 4. Control visibility of Read-Only Notification Banner
    const readonlyBanner = document.getElementById('readonly-notice-banner');
    const readonlyBadge = document.getElementById('readonly-username-badge');
    if (readonlyBanner) {
      if (!isAdmin) {
        readonlyBanner.classList.remove('hidden');
        if (readonlyBadge) {
          readonlyBadge.textContent = displayName;
        }
      } else {
        readonlyBanner.classList.add('hidden');
      }
    }

    // 5. Update Table Actions Column Header
    const tableActionHeader = document.getElementById('table-action-header');
    if (tableActionHeader) {
      tableActionHeader.textContent = isAdmin ? 'Actions' : 'Report / Payslip';
    }

    // 6. Control visibility of empty state Add button (Admin only)
    const emptyAddBtn = document.getElementById('empty-state-add-btn');
    if (emptyAddBtn) {
      if (isAdmin) {
        emptyAddBtn.classList.remove('hidden');
      } else {
        emptyAddBtn.classList.add('hidden');
      }
    }
    
    refreshEmployeeData();
    renderDashboard();
  } else {
    if (loginView) loginView.classList.remove('hidden');
    if (mainHeader) mainHeader.classList.add('hidden');
    if (mainWrapper) mainWrapper.classList.add('hidden');
    if (appFooter) appFooter.classList.add('hidden');
  }
}

/**
 * Switches the active authentication tab between 'signin' and 'register'.
 * 
 * @param {'signin'|'register'} mode 
 */
function switchAuthTab(mode) {
  const signinTab = document.getElementById('auth-tab-signin');
  const registerTab = document.getElementById('auth-tab-register');
  const signinSection = document.getElementById('auth-signin-section');
  const registerSection = document.getElementById('auth-register-section');
  const loginErrorAlert = document.getElementById('login-error-alert');
  const registerErrorAlert = document.getElementById('register-error-alert');

  if (loginErrorAlert) loginErrorAlert.classList.add('hidden');
  if (registerErrorAlert) registerErrorAlert.classList.add('hidden');

  if (mode === 'register') {
    if (signinTab) {
      signinTab.classList.remove('active');
      signinTab.setAttribute('aria-selected', 'false');
    }
    if (registerTab) {
      registerTab.classList.add('active');
      registerTab.setAttribute('aria-selected', 'true');
    }
    if (signinSection) signinSection.classList.add('hidden');
    if (registerSection) {
      registerSection.classList.remove('hidden');
      const usernameInput = document.getElementById('register-username');
      if (usernameInput) usernameInput.focus();
    }
  } else {
    if (registerTab) {
      registerTab.classList.remove('active');
      registerTab.setAttribute('aria-selected', 'false');
    }
    if (signinTab) {
      signinTab.classList.add('active');
      signinTab.setAttribute('aria-selected', 'true');
    }
    if (registerSection) registerSection.classList.add('hidden');
    if (signinSection) {
      signinSection.classList.remove('hidden');
      const usernameInput = document.getElementById('login-username');
      if (usernameInput) usernameInput.focus();
    }
  }
}

/**
 * Handles login / sign in form submission.
 * 
 * @param {Event} event 
 */
function handleLoginSubmit(event) {
  event.preventDefault();

  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const rememberCheckbox = document.getElementById('remember-login-chk');
  const loginErrorAlert = document.getElementById('login-error-alert');
  const loginErrorText = document.getElementById('login-error-text');

  const enteredUsername = usernameInput.value.trim();
  const enteredPassword = passwordInput.value.trim();

  if (loginErrorAlert) {
    loginErrorAlert.className = 'login-alert';
  }

  if (!enteredUsername || !enteredPassword) {
    if (loginErrorAlert) {
      loginErrorAlert.classList.remove('hidden');
      loginErrorText.textContent = 'Please enter both username and password.';
    }
    return;
  }

  // Authenticate against registered users in StorageManager
  const authResult = StorageManager.authenticateUser(enteredUsername, enteredPassword);

  if (authResult.success) {
    if (loginErrorAlert) loginErrorAlert.classList.add('hidden');

    const authUsername = authResult.user.username;

    if (rememberCheckbox && rememberCheckbox.checked) {
      localStorage.setItem(AUTH_SESSION_STORAGE_KEY, authUsername);
    } else {
      sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, authUsername);
    }

    showNotificationToast(authResult.message, 'success');
    checkAuthenticationState();
  } else {
    if (loginErrorAlert) {
      loginErrorAlert.classList.remove('hidden');
      loginErrorText.textContent = `Invalid username or password. Please verify your credentials or create a new account in the Register tab.`;
      loginErrorAlert.style.animation = 'none';
      setTimeout(() => {
        loginErrorAlert.style.animation = '';
      }, 10);
    }
  }
}

/**
 * Handles user registration form submission.
 * 
 * @param {Event} event 
 */
function handleRegisterSubmit(event) {
  event.preventDefault();

  const usernameInput = document.getElementById('register-username');
  const fullnameInput = document.getElementById('register-fullname');
  const roleSelect = document.getElementById('register-role');
  const passwordInput = document.getElementById('register-password');
  const confirmPasswordInput = document.getElementById('register-confirm-password');
  const registerErrorAlert = document.getElementById('register-error-alert');
  const registerErrorText = document.getElementById('register-error-text');

  const username = usernameInput ? usernameInput.value.trim() : '';
  const fullName = fullnameInput && fullnameInput.value.trim() 
    ? formatCapitalizedName(fullnameInput.value.trim()) 
    : '';
  const role = roleSelect ? roleSelect.value : 'Payroll Officer';
  const password = passwordInput ? passwordInput.value.trim() : '';
  const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : '';

  if (!username) {
    if (registerErrorAlert) {
      registerErrorAlert.classList.remove('hidden');
      registerErrorText.textContent = 'Please choose a username for login.';
    }
    if (usernameInput) usernameInput.focus();
    return;
  }

  if (!password) {
    if (registerErrorAlert) {
      registerErrorAlert.classList.remove('hidden');
      registerErrorText.textContent = 'Please enter a password.';
    }
    if (passwordInput) passwordInput.focus();
    return;
  }

  if (password.length < 3) {
    if (registerErrorAlert) {
      registerErrorAlert.classList.remove('hidden');
      registerErrorText.textContent = 'Password must be at least 3 characters long.';
    }
    if (passwordInput) passwordInput.focus();
    return;
  }

  if (confirmPasswordInput && confirmPassword && password !== confirmPassword) {
    if (registerErrorAlert) {
      registerErrorAlert.classList.remove('hidden');
      registerErrorText.textContent = 'Passwords do not match. Please re-enter.';
    }
    if (confirmPasswordInput) confirmPasswordInput.focus();
    return;
  }

  // Register in storage
  const registrationResult = StorageManager.registerUser({
    fullName: fullName || username,
    username,
    role,
    password
  });

  if (registrationResult.success) {
    if (registerErrorAlert) registerErrorAlert.classList.add('hidden');
    showNotificationToast(`Account '${username}' created! You can now sign in.`, 'success');
    
    // Clear registration form
    const registerForm = document.getElementById('register-form');
    if (registerForm) registerForm.reset();

    // Switch to Sign In tab
    switchAuthTab('signin');

    // Pre-fill username and password for instantaneous sign in!
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    if (loginUsername) loginUsername.value = username;
    if (loginPassword) {
      loginPassword.value = password;
      loginPassword.focus();
    }

    // Show a success banner on the Sign In form confirming this username is ready to login
    const loginErrorAlert = document.getElementById('login-error-alert');
    const loginErrorText = document.getElementById('login-error-text');
    if (loginErrorAlert && loginErrorText) {
      loginErrorAlert.className = 'login-alert login-alert-success';
      loginErrorAlert.classList.remove('hidden');
      loginErrorText.innerHTML = `<i class="fa-solid fa-circle-check"></i> Account created! Username <strong>${escapeHtml(username)}</strong> is ready to sign in.`;
    }

    const loginSubmitBtn = document.getElementById('login-submit-btn');
    if (loginSubmitBtn) loginSubmitBtn.focus();
  } else {
    if (registerErrorAlert) {
      registerErrorAlert.classList.remove('hidden');
      registerErrorText.textContent = registrationResult.message;
    }
  }
}

/**
 * Handles user sign out.
 */
function handleLogout() {
  localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.reset();

  showNotificationToast('You have been signed out successfully.', 'info');
  checkAuthenticationState();
}

/**
 * Toggles sign in password field visibility.
 */
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('login-password');
  const toggleIcon = document.getElementById('password-toggle-icon');

  if (!passwordInput || !toggleIcon) return;

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleIcon.className = 'fa-solid fa-eye-slash';
  } else {
    passwordInput.type = 'password';
    toggleIcon.className = 'fa-solid fa-eye';
  }
}

/**
 * Toggles register password field visibility.
 */
function toggleRegisterPasswordVisibility() {
  const passwordInput = document.getElementById('register-password');
  const toggleIcon = document.getElementById('register-password-icon');

  if (!passwordInput || !toggleIcon) return;

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleIcon.className = 'fa-solid fa-eye-slash';
  } else {
    passwordInput.type = 'password';
    toggleIcon.className = 'fa-solid fa-eye';
  }
}

/**
 * Auto-fills demo credentials for presentations (Admin Admin).
 */
function fillDemoCredentials() {
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const loginErrorAlert = document.getElementById('login-error-alert');

  if (usernameInput) usernameInput.value = DEFAULT_ADMIN_USERNAME;
  if (passwordInput) passwordInput.value = DEFAULT_ADMIN_PASSWORD;
  if (loginErrorAlert) loginErrorAlert.classList.add('hidden');

  showNotificationToast(`Demo admin credentials filled (${DEFAULT_ADMIN_USERNAME} / ${DEFAULT_ADMIN_PASSWORD}).`, 'info');
  const submitBtn = document.getElementById('login-submit-btn');
  if (submitBtn) submitBtn.focus();
}

/**
 * Auto-fills demo viewer credentials for presentations (Read-Only).
 */
function fillDemoViewerCredentials() {
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const loginErrorAlert = document.getElementById('login-error-alert');

  if (usernameInput) usernameInput.value = DEFAULT_VIEWER_USERNAME;
  if (passwordInput) passwordInput.value = DEFAULT_VIEWER_PASSWORD;
  if (loginErrorAlert) loginErrorAlert.classList.add('hidden');

  showNotificationToast(`Demo viewer credentials filled (${DEFAULT_VIEWER_USERNAME} / ${DEFAULT_VIEWER_PASSWORD}).`, 'info');
  const submitBtn = document.getElementById('login-submit-btn');
  if (submitBtn) submitBtn.focus();
}

/**
 * Computes the next suggested sequential Employee ID.
 * 
 * @param {Array<Employee>} employeeList 
 * @returns {string} e.g. "EMP-007"
 */
function getSuggestedNextEmployeeId(employeeList) {
  if (!employeeList || employeeList.length === 0) {
    return 'EMP-001';
  }

  const lastEmployee = employeeList[employeeList.length - 1];
  const match = lastEmployee.employeeId.match(/^([A-Za-z_-]*)(\d+)$/);

  if (match) {
    const prefix = match[1];
    const numericPart = match[2];
    const paddingLength = numericPart.length;
    const nextNum = parseInt(numericPart, 10) + 1;
    return `${prefix}${String(nextNum).padStart(paddingLength, '0')}`;
  }

  return `EMP-${String(employeeList.length + 1).padStart(3, '0')}`;
}

/**
 * Opens the Add Employee Modal with a clean blank form.
 * Restricted to Administrator only.
 */
function openAddEmployeeModal() {
  // Permission Guard: Only Administrator can add employee records
  if (!isCurrentUserAdmin()) {
    showNotificationToast('Permission Denied: Only Administrator can add new employee records.', 'error');
    return;
  }

  const modalElement = document.getElementById('employee-modal');
  const modalFormTitle = document.getElementById('modal-form-title');
  const modalIcon = document.getElementById('modal-icon');
  const employeeForm = document.getElementById('employee-form');
  const editOriginalId = document.getElementById('edit-original-id');
  const inputEmployeeId = document.getElementById('input-employee-id');

  // Clear errors and form
  clearFormErrors();
  employeeForm.reset();
  editOriginalId.value = '';

  // Generate suggested next sequential ID
  inputEmployeeId.value = getSuggestedNextEmployeeId(currentEmployeeRecords);
  inputEmployeeId.removeAttribute('readonly');

  document.getElementById('input-working-days').value = 30;
  document.getElementById('input-overtime-hours').value = 0;

  modalFormTitle.textContent = 'Add New Employee';
  modalIcon.className = 'fa-solid fa-user-plus modal-icon';

  updateLiveCalculationPreview();
  modalElement.classList.remove('hidden');
  document.getElementById('input-employee-name').focus();
}

/**
 * Opens the Edit Employee Modal pre-populated with employee data.
 * 
 * @param {string} employeeId 
 */
function openEditEmployeeModal(employeeId) {
  // Permission Guard: Only Administrator can edit employee records
  if (!isCurrentUserAdmin()) {
    showNotificationToast('Permission Denied: Only Administrator can edit employee details.', 'error');
    return;
  }

  const employee = StorageManager.getEmployeeById(employeeId);
  if (!employee) {
    showNotificationToast(`Employee ${employeeId} not found.`, 'error');
    return;
  }

  const modalElement = document.getElementById('employee-modal');
  const modalFormTitle = document.getElementById('modal-form-title');
  const modalIcon = document.getElementById('modal-icon');
  const editOriginalId = document.getElementById('edit-original-id');

  clearFormErrors();

  editOriginalId.value = employee.employeeId;
  document.getElementById('input-employee-id').value = employee.employeeId;
  document.getElementById('input-employee-name').value = formatCapitalizedName(employee.employeeName);
  document.getElementById('input-department').value = employee.department;
  document.getElementById('input-designation').value = employee.designation;
  document.getElementById('input-basic-salary').value = employee.basicSalary;
  document.getElementById('input-working-days').value = employee.workingDays;
  document.getElementById('input-overtime-hours').value = employee.overtimeHours;

  modalFormTitle.textContent = `Edit Employee: ${formatCapitalizedName(employee.employeeName)}`;
  modalIcon.className = 'fa-solid fa-user-pen modal-icon';

  updateLiveCalculationPreview();
  modalElement.classList.remove('hidden');
}

/**
 * Handles submission of Add or Edit Employee form.
 * 
 * @param {Event} event 
 */
function handleEmployeeFormSubmit(event) {
  event.preventDefault();

  // Permission Guard: Only Administrator can modify employee records
  if (!isCurrentUserAdmin()) {
    showNotificationToast('Permission Denied: Only Administrator can save or modify employee details.', 'error');
    return;
  }

  clearFormErrors();

  const originalId = document.getElementById('edit-original-id').value.trim();
  const employeeId = document.getElementById('input-employee-id').value.trim();
  const rawEmployeeName = document.getElementById('input-employee-name').value.trim();
  const employeeName = formatCapitalizedName(rawEmployeeName);
  const department = document.getElementById('input-department').value.trim();
  const designation = document.getElementById('input-designation').value.trim();
  const basicSalary = parseFloat(document.getElementById('input-basic-salary').value);
  const workingDays = parseInt(document.getElementById('input-working-days').value, 10);
  const overtimeHours = parseFloat(document.getElementById('input-overtime-hours').value) || 0;

  // Validation
  let hasValidationErrors = false;

  if (!employeeId) {
    showFieldError('error-employee-id', 'Employee ID is required.');
    hasValidationErrors = true;
  }

  if (!employeeName) {
    showFieldError('error-employee-name', 'Employee Name is required.');
    hasValidationErrors = true;
  }

  if (!department) {
    showFieldError('error-department', 'Please select a department.');
    hasValidationErrors = true;
  }

  if (!designation) {
    showFieldError('error-designation', 'Designation is required.');
    hasValidationErrors = true;
  }

  if (isNaN(basicSalary) || basicSalary <= 0) {
    showFieldError('error-basic-salary', 'Enter a valid basic salary (greater than 0).');
    hasValidationErrors = true;
  }

  if (isNaN(workingDays) || workingDays < 0 || workingDays > 30) {
    showFieldError('error-working-days', 'Working days must be between 0 and 30.');
    hasValidationErrors = true;
  }

  if (isNaN(overtimeHours) || overtimeHours < 0) {
    showFieldError('error-overtime-hours', 'Overtime hours cannot be negative.');
    hasValidationErrors = true;
  }

  if (hasValidationErrors) return;

  const newEmployeeInstance = new Employee({
    employeeId,
    employeeName,
    department,
    designation,
    basicSalary,
    workingDays,
    overtimeHours
  });

  let operationResult;

  if (originalId) {
    // Edit existing employee
    operationResult = StorageManager.updateEmployee(originalId, newEmployeeInstance);
  } else {
    // Add new employee
    operationResult = StorageManager.addEmployee(newEmployeeInstance);
  }

  if (operationResult.success) {
    showNotificationToast(operationResult.message, 'success');
    closeEmployeeModal();
    refreshEmployeeData();
    renderDashboard();
  } else {
    showNotificationToast(operationResult.message, 'error');
  }
}

/**
 * Opens the Payslip Modal and populates breakdown tables and company details.
 * 
 * @param {string} employeeId 
 */
function openPayslipModal(employeeId) {
  const employee = StorageManager.getEmployeeById(employeeId);
  if (!employee) {
    showNotificationToast(`Employee ${employeeId} not found.`, 'error');
    return;
  }

  const breakdown = employee.payrollBreakdown;

  // Header & Info
  document.getElementById('payslip-emp-id').textContent = employee.employeeId;
  document.getElementById('payslip-emp-name').textContent = employee.employeeName;
  document.getElementById('payslip-emp-dept').textContent = employee.department;
  document.getElementById('payslip-emp-desig').textContent = employee.designation;
  document.getElementById('payslip-emp-days').textContent = `${employee.workingDays} Days`;
  document.getElementById('payslip-emp-ot').textContent = `${employee.overtimeHours} Hours`;

  const currentDate = new Date();
  const monthYearString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  document.getElementById('payslip-date-text').textContent = monthYearString;

  // Earnings Table
  document.getElementById('slip-basic-pay').textContent = PayrollCalculator.formatCurrency(breakdown.basicPay);
  document.getElementById('slip-overtime-pay').textContent = PayrollCalculator.formatCurrency(breakdown.overtimePay);
  document.getElementById('slip-hra').textContent = PayrollCalculator.formatCurrency(breakdown.hraAmount);
  document.getElementById('slip-da').textContent = PayrollCalculator.formatCurrency(breakdown.daAmount);
  document.getElementById('slip-conveyance').textContent = PayrollCalculator.formatCurrency(breakdown.conveyanceAmount);
  document.getElementById('slip-medical').textContent = PayrollCalculator.formatCurrency(breakdown.medicalAmount);
  document.getElementById('slip-gross-earnings').textContent = PayrollCalculator.formatCurrency(breakdown.grossSalary);

  // Deductions Table
  document.getElementById('slip-pf').textContent = PayrollCalculator.formatCurrency(breakdown.pfDeduction);
  document.getElementById('slip-pt').textContent = PayrollCalculator.formatCurrency(breakdown.professionalTax);
  document.getElementById('slip-tds').textContent = PayrollCalculator.formatCurrency(breakdown.incomeTax);
  document.getElementById('slip-total-deductions').textContent = PayrollCalculator.formatCurrency(breakdown.totalDeductions);

  // Net Salary
  document.getElementById('payslip-net-amount').textContent = PayrollCalculator.formatCurrency(breakdown.netSalary);
  document.getElementById('payslip-net-words').textContent = convertNumberToCurrencyWords(breakdown.netSalary);

  document.getElementById('payslip-modal').classList.remove('hidden');
}

/**
 * Opens delete confirmation dialog.
 * 
 * @param {string} employeeId 
 */
/**
 * Opens delete confirmation dialog.
 * 
 * @param {string} employeeId 
 */
function openDeleteConfirmModal(employeeId) {
  // Permission Guard: Only Administrator can delete employee records
  if (!isCurrentUserAdmin()) {
    showNotificationToast('Permission Denied: Only Administrator can delete employee records.', 'error');
    return;
  }

  const employee = StorageManager.getEmployeeById(employeeId);
  if (!employee) return;

  pendingDeleteEmployeeId = employeeId;
  document.getElementById('delete-employee-name').textContent = employee.employeeName;
  document.getElementById('delete-employee-id').textContent = employee.employeeId;

  document.getElementById('delete-modal').classList.remove('hidden');
}

/**
 * Executes the confirmed delete operation.
 */
function executeEmployeeDeletion() {
  // Permission Guard: Only Administrator can delete employee records
  if (!isCurrentUserAdmin()) {
    showNotificationToast('Permission Denied: Only Administrator can delete employee records.', 'error');
    return;
  }

  if (!pendingDeleteEmployeeId) return;

  const result = StorageManager.deleteEmployee(pendingDeleteEmployeeId);
  if (result.success) {
    showNotificationToast(result.message, 'success');
    closeDeleteModal();
    refreshEmployeeData();
    renderDashboard();
  } else {
    showNotificationToast(result.message, 'error');
  }
}

/**
 * Resets storage to original sample records and re-renders.
 */
function handleResetSampleData() {
  // Permission Guard: Only Administrator can reset data
  if (!isCurrentUserAdmin()) {
    showNotificationToast('Permission Denied: Only Administrator can reset sample records.', 'error');
    return;
  }

  const confirmReset = window.confirm('Reset all employee records to initial sample data? Any newly added records will be overwritten.');
  if (confirmReset) {
    StorageManager.resetToSampleData();
    refreshEmployeeData();
    renderDashboard();
    showNotificationToast('Reset to initial sample employee records.', 'info');
  }
}

/**
 * Generates and downloads the complete payroll report as a formatted CSV spreadsheet.
 * Accessible to both Administrator and Read-Only registered users.
 */
function downloadPayrollReportCSV() {
  const records = currentEmployeeRecords;
  if (!records || records.length === 0) {
    showNotificationToast('No employee records available to export.', 'warning');
    return;
  }

  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const headers = [
    'Employee ID',
    'Employee Name',
    'Department',
    'Designation',
    'Basic Salary (INR)',
    'Working Days',
    'Overtime Hours',
    'Basic Pay (INR)',
    'Overtime Pay (INR)',
    'HRA (20%) (INR)',
    'DA (10%) (INR)',
    'Conveyance Allowance (INR)',
    'Medical Allowance (INR)',
    'Total Allowances (INR)',
    'Gross Salary (INR)',
    'PF Deduction (12%) (INR)',
    'Professional Tax (INR)',
    'Income Tax / TDS (INR)',
    'Total Deductions (INR)',
    'Net Payable Salary (INR)'
  ];

  const rows = records.map(emp => {
    const bd = emp.payrollBreakdown;
    return [
      `"${emp.employeeId}"`,
      `"${emp.employeeName}"`,
      `"${emp.department}"`,
      `"${emp.designation}"`,
      emp.basicSalary.toFixed(2),
      emp.workingDays,
      emp.overtimeHours,
      bd.basicPay.toFixed(2),
      bd.overtimePay.toFixed(2),
      bd.hraAmount.toFixed(2),
      bd.daAmount.toFixed(2),
      bd.conveyanceAmount.toFixed(2),
      bd.medicalAmount.toFixed(2),
      bd.totalAllowances.toFixed(2),
      bd.grossSalary.toFixed(2),
      bd.pfDeduction.toFixed(2),
      bd.professionalTax.toFixed(2),
      bd.incomeTax.toFixed(2),
      bd.totalDeductions.toFixed(2),
      bd.netSalary.toFixed(2)
    ].join(',');
  });

  const totalGross = records.reduce((sum, r) => sum + r.payrollBreakdown.grossSalary, 0);
  const totalDeductions = records.reduce((sum, r) => sum + r.payrollBreakdown.totalDeductions, 0);
  const totalNet = records.reduce((sum, r) => sum + r.payrollBreakdown.netSalary, 0);

  const summaryRow = [
    '"TOTAL"',
    `"Total Employees: ${records.length}"`,
    '""',
    '""',
    '""',
    '""',
    '""',
    '""',
    '""',
    '""',
    '""',
    '""',
    '""',
    '""',
    totalGross.toFixed(2),
    '""',
    '""',
    '""',
    totalDeductions.toFixed(2),
    totalNet.toFixed(2)
  ].join(',');

  const csvContent = [
    `"EMPLOYEE PAYROLL SUMMARY REPORT - ACADEMIC TECH ENTERPRISES PVT. LTD."`,
    `"Report Date: ${currentDateStr}"`,
    `"Exported By: ${sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY) || localStorage.getItem(AUTH_SESSION_STORAGE_KEY) || 'User'}"`,
    '',
    headers.join(','),
    ...rows,
    '',
    summaryRow
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', downloadUrl);
  link.setAttribute('download', `Payroll_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);

  showNotificationToast('Payroll report downloaded successfully (CSV).', 'success');
}

/**
 * Sets up all application event listeners.
 */
function setupEventListeners() {
  // Authentication Listeners (Sign In & Register)
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
  }

  // Auth Mode Switcher Tab Buttons
  const authTabSignin = document.getElementById('auth-tab-signin');
  if (authTabSignin) {
    authTabSignin.addEventListener('click', () => switchAuthTab('signin'));
  }

  const authTabRegister = document.getElementById('auth-tab-register');
  if (authTabRegister) {
    authTabRegister.addEventListener('click', () => switchAuthTab('register'));
  }

  // Cross-link buttons
  const switchToRegisterBtn = document.getElementById('switch-to-register-btn');
  if (switchToRegisterBtn) {
    switchToRegisterBtn.addEventListener('click', () => switchAuthTab('register'));
  }

  const switchToSigninBtn = document.getElementById('switch-to-signin-btn');
  if (switchToSigninBtn) {
    switchToSigninBtn.addEventListener('click', () => switchAuthTab('signin'));
  }

  // Toggle Password Visibility
  const togglePasswordBtn = document.getElementById('toggle-password-btn');
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
  }

  const toggleRegisterPasswordBtn = document.getElementById('toggle-register-password-btn');
  if (toggleRegisterPasswordBtn) {
    toggleRegisterPasswordBtn.addEventListener('click', toggleRegisterPasswordVisibility);
  }

  const fillDemoBtn = document.getElementById('fill-demo-credentials-btn');
  if (fillDemoBtn) {
    fillDemoBtn.addEventListener('click', fillDemoCredentials);
  }

  const fillDemoViewerBtn = document.getElementById('fill-demo-viewer-btn');
  if (fillDemoViewerBtn) {
    fillDemoViewerBtn.addEventListener('click', fillDemoViewerCredentials);
  }

  const clearLoginHistoryBtn = document.getElementById('clear-login-history-btn');
  if (clearLoginHistoryBtn) {
    clearLoginHistoryBtn.addEventListener('click', () => {
      const result = StorageManager.clearAllLoginHistory();
      const loginForm = document.getElementById('login-form');
      if (loginForm) loginForm.reset();
      const registerForm = document.getElementById('register-form');
      if (registerForm) registerForm.reset();
      const loginErrorAlert = document.getElementById('login-error-alert');
      if (loginErrorAlert) loginErrorAlert.classList.add('hidden');
      showNotificationToast(result.message, 'success');
      checkAuthenticationState();
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Auto-Capitalize First Letter of Each Word in Employee Name
  const employeeNameInput = document.getElementById('input-employee-name');
  if (employeeNameInput) {
    // Live capitalization as the user types
    employeeNameInput.addEventListener('input', () => {
      const originalValue = employeeNameInput.value;
      const cursorPosition = employeeNameInput.selectionStart;
      const capitalizedValue = formatCapitalizedName(originalValue);
      if (originalValue !== capitalizedValue) {
        employeeNameInput.value = capitalizedValue;
        employeeNameInput.setSelectionRange(cursorPosition, cursorPosition);
      }
    });

    // Ensure tidy capitalization on blur
    employeeNameInput.addEventListener('blur', () => {
      employeeNameInput.value = formatCapitalizedName(employeeNameInput.value);
    });
  }

  // Header Add Employee Button (Admin only)
  const addHeaderBtn = document.getElementById('add-employee-header-btn');
  if (addHeaderBtn) {
    addHeaderBtn.addEventListener('click', openAddEmployeeModal);
  }
  
  // Empty State Add Employee Button (Admin only)
  const emptyStateAddBtn = document.getElementById('empty-state-add-btn');
  if (emptyStateAddBtn) {
    emptyStateAddBtn.addEventListener('click', openAddEmployeeModal);
  }

  // Form Submit (Admin only)
  const employeeForm = document.getElementById('employee-form');
  if (employeeForm) {
    employeeForm.addEventListener('submit', handleEmployeeFormSubmit);
  }

  // Live Preview Listeners
  ['input-basic-salary', 'input-working-days', 'input-overtime-hours'].forEach(elementId => {
    const inputElement = document.getElementById(elementId);
    if (inputElement) {
      inputElement.addEventListener('input', updateLiveCalculationPreview);
    }
  });

  // Modal Close buttons
  document.getElementById('close-employee-modal-btn').addEventListener('click', closeEmployeeModal);
  document.getElementById('cancel-employee-modal-btn').addEventListener('click', closeEmployeeModal);
  
  document.getElementById('close-payslip-modal-btn').addEventListener('click', closePayslipModal);
  document.getElementById('close-payslip-bottom-btn').addEventListener('click', closePayslipModal);

  document.getElementById('close-delete-modal-btn').addEventListener('click', closeDeleteModal);
  document.getElementById('cancel-delete-btn').addEventListener('click', closeDeleteModal);
  document.getElementById('confirm-delete-btn').addEventListener('click', executeEmployeeDeletion);

  // Print buttons
  document.getElementById('print-payslip-btn').addEventListener('click', () => window.print());
  document.getElementById('print-summary-btn').addEventListener('click', () => window.print());

  // Download Report (CSV) buttons - Accessible by both Admin and Read-Only users
  const downloadReportBtn = document.getElementById('download-report-btn');
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener('click', downloadPayrollReportCSV);
  }

  const bannerDownloadBtn = document.getElementById('banner-download-btn');
  if (bannerDownloadBtn) {
    bannerDownloadBtn.addEventListener('click', downloadPayrollReportCSV);
  }

  // Search input with debounce / immediate filter
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  searchInput.addEventListener('input', () => {
    if (searchInput.value.trim().length > 0) {
      clearSearchBtn.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
    }
    renderDashboard();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    renderDashboard();
    searchInput.focus();
  });

  // Filter & Sort dropdowns
  document.getElementById('department-filter').addEventListener('change', renderDashboard);
  document.getElementById('sort-selector').addEventListener('change', renderDashboard);

  // Reset sample data
  document.getElementById('reset-sample-data-btn').addEventListener('click', handleResetSampleData);

  // Table row action delegation (View, Edit, Delete)
  document.getElementById('payroll-table-body').addEventListener('click', (event) => {
    const actionButton = event.target.closest('.action-btn');
    if (!actionButton) return;

    const actionType = actionButton.getAttribute('data-action');
    const employeeId = actionButton.getAttribute('data-id');

    if (actionType === 'view-payslip') {
      openPayslipModal(employeeId);
    } else if (actionType === 'edit-employee') {
      openEditEmployeeModal(employeeId);
    } else if (actionType === 'delete-employee') {
      openDeleteConfirmModal(employeeId);
    }
  });

  // Close modals on Escape key
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeEmployeeModal();
      closePayslipModal();
      closeDeleteModal();
    }
  });

  // Close modal when clicking on the dimmed backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) {
        closeEmployeeModal();
        closePayslipModal();
        closeDeleteModal();
      }
    });
  });
}

// Modal closing helpers
function closeEmployeeModal() {
  document.getElementById('employee-modal').classList.add('hidden');
}

function closePayslipModal() {
  document.getElementById('payslip-modal').classList.add('hidden');
}

function closeDeleteModal() {
  document.getElementById('delete-modal').classList.add('hidden');
  pendingDeleteEmployeeId = null;
}

// Error state helpers
function showFieldError(errorElementId, message) {
  const errorElement = document.getElementById(errorElementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
  }
}

function clearFormErrors() {
  document.querySelectorAll('.input-error-msg').forEach(el => {
    el.textContent = '';
    el.classList.add('hidden');
  });
}

/**
 * Displays a non-blocking toast notification.
 * 
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 */
function showNotificationToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconMarkup = '<i class="fa-solid fa-circle-info"></i>';
  if (type === 'success') iconMarkup = '<i class="fa-solid fa-circle-check text-green"></i>';
  if (type === 'error') iconMarkup = '<i class="fa-solid fa-circle-exclamation text-red"></i>';

  toast.innerHTML = `
    ${iconMarkup}
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Converts a numeric amount to Indian currency words format for the payslip.
 * 
 * @param {number} amount 
 * @returns {string} e.g. "INR Sixty-Five Thousand Four Hundred Only"
 */
function convertNumberToCurrencyWords(amount) {
  if (isNaN(amount) || amount <= 0) return 'INR Zero Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teenDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(num) {
    if (num < 10) return singleDigits[num];
    if (num >= 10 && num < 20) return teenDigits[num - 10];
    return `${tensDigits[Math.floor(num / 10)]} ${singleDigits[num % 10]}`.trim();
  }

  function convertThreeDigits(num) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    let result = '';
    if (hundred > 0) result += `${singleDigits[hundred]} Hundred `;
    if (remainder > 0) result += convertTwoDigits(remainder);
    return result.trim();
  }

  const integerPart = Math.floor(amount);
  const crore = Math.floor(integerPart / 10000000);
  const lakh = Math.floor((integerPart % 10000000) / 100000);
  const thousand = Math.floor((integerPart % 100000) / 1000);
  const remainder = integerPart % 1000;

  let words = 'INR ';
  if (crore > 0) words += `${convertThreeDigits(crore)} Crore `;
  if (lakh > 0) words += `${convertTwoDigits(lakh)} Lakh `;
  if (thousand > 0) words += `${convertTwoDigits(thousand)} Thousand `;
  if (remainder > 0) words += `${convertThreeDigits(remainder)} `;

  return `${words.trim()} Rupees Only`;
}

/**
 * Escapes HTML characters to prevent XSS.
 * 
 * @param {string} str 
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Bootstrap application on window DOMContentLoaded
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializePayrollApp);
}
