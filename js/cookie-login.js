// Demo user accounts for authentication
const demoAccounts = {
    'admin': { password: 'admin123', fullName: 'Administrator', role: 'admin' },
    'user1': { password: 'user123', fullName: 'Teng Ming Chun', role: 'user' },
    'user2': { password: 'pass456', fullName: 'Darryl Tan Hwee Jian', role: 'user' },
    'user3': { password: 'pass789', fullName: 'Ling Wei Lai', role: 'user' },
    'user4': { password: 'pass765', fullName: 'Teoh Wei Ming', role: 'user' },
    'demo': { password: 'demo', fullName: 'Demo User', role: 'demo' }
};

// Cookie utility functions
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + expires.toUTCString() + ';path=/';
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// Account-specific cookie functions
function setAccountSpecificData(username, data) {
    const accountKey = `account_${username}_data`;
    setCookie(accountKey, JSON.stringify(data), 30);
}

function getAccountSpecificData(username) {
    const accountKey = `account_${username}_data`;
    const data = getCookie(accountKey);
    return data ? JSON.parse(data) : null;
}

function setCurrentUser(userInfo) {
    setCookie('current_user', JSON.stringify(userInfo), 1); // 1 day session
    setCookie('is_logged_in', 'true', 1);
}

function clearCurrentUser() {
    deleteCookie('current_user');
    deleteCookie('is_logged_in');
}

function getCurrentUser() {
    const currentUser = getCookie('current_user');
    return currentUser ? JSON.parse(currentUser) : null;
}

// Show message function
function showMessage(message, type) {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
        messageContainer.innerHTML = `<div class="${type}-message" style="
            background: ${type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
            border: 1px solid ${type === 'success' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'};
            color: ${type === 'success' ? '#4CAF50' : '#F44336'};
            padding: 10px 15px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
            font-size: 14px;
        ">${message}</div>`;
        
        setTimeout(() => {
            messageContainer.innerHTML = '';
        }, 3000);
    }
}

// Authenticate user function
function authenticateUser(username, password) {
    // Check if user exists and password matches
    if (demoAccounts[username] && demoAccounts[username].password === password) {
        return {
            success: true,
            user: {
                username: username,
                fullName: demoAccounts[username].fullName,
                role: demoAccounts[username].role,
                loginTime: new Date().toISOString()
            }
        };
    }
    return { success: false, message: 'Invalid username or password' };
}

// Load saved credentials for specific account
function loadSavedCredentials() {
    const savedUsername = getCookie('saved_username');
    const savedPassword = getCookie('saved_password');
    const rememberMe = getCookie('remember_me');

    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password-field');
    const rememberCheckbox = document.getElementById('remember-me');

    if (savedUsername && savedPassword && rememberMe === 'true' && usernameField && passwordField && rememberCheckbox) {
        usernameField.value = savedUsername;
        passwordField.value = savedPassword;
        rememberCheckbox.checked = true;
        
        setTimeout(() => {
            showMessage(`Welcome back, ${savedUsername}! Credentials loaded.`, 'success');
        }, 500);
    }
}

// Handle form submission with authentication and redirect
function handleFormSubmission(e) {
    e.preventDefault();
    
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password-field');
    const rememberCheckbox = document.getElementById('remember-me');

    if (!usernameField || !passwordField || !rememberCheckbox) {
        console.error('Required form elements not found');
        return;
    }

    const username = usernameField.value.trim();
    const password = passwordField.value;
    const rememberMe = rememberCheckbox.checked;

    // Validation
    if (!username || !password) {
        showMessage('Please fill in all fields!', 'error');
        return;
    }

    // Show loading message
    showMessage('Authenticating...', 'success');

    // Simulate authentication delay
    setTimeout(() => {
        const authResult = authenticateUser(username, password);
        
        if (authResult.success) {
            // Save current user session
            setCurrentUser(authResult.user);
            
            // Save credentials if "Remember Me" is checked
            if (rememberMe) {
                setCookie('saved_username', username, 30);
                setCookie('saved_password', password, 30);
                setCookie('remember_me', 'true', 30);
            } else {
                // Clear saved credentials if not remembering
                deleteCookie('saved_username');
                deleteCookie('saved_password');
                deleteCookie('remember_me');
            }

            // Save account-specific data
            const existingData = getAccountSpecificData(username) || {};
            const accountData = {
                lastLogin: new Date().toISOString(),
                loginCount: (existingData.loginCount || 0) + 1,
                preferences: existingData.preferences || {
                    theme: 'default',
                    language: 'en',
                    notifications: true
                },
                rememberMe: rememberMe,
                browser: navigator.userAgent,
                loginHistory: [
                    ...(existingData.loginHistory || []).slice(-9), // Keep last 9 logins
                    {
                        timestamp: new Date().toISOString(),
                        ip: 'localhost', // In production, get real IP
                        userAgent: navigator.userAgent.substring(0, 50)
                    }
                ]
            };
            setAccountSpecificData(username, accountData);

            showMessage(`Welcome ${authResult.user.fullName}! Redirecting to home page...`, 'success');
            
            // Redirect to index.html after successful login
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } else {
            showMessage(authResult.message, 'error');
        }
    }, 1000);
}

// Password toggle functionality
function setupPasswordToggle() {
    const togglePassword = document.querySelector('.toggle-password');
    const passwordField = document.getElementById('password-field');
    
    if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', function() {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
            this.style.color = type === 'text' ? '#007bff' : '';
        });
    }
}

// Clear all account data function (for testing)
function clearAllAccountData() {
    // Clear all cookies
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        deleteCookie(name);
    }
    
    // Clear form fields if they exist
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password-field');
    const rememberCheckbox = document.getElementById('remember-me');
    
    if (usernameField) usernameField.value = '';
    if (passwordField) passwordField.value = '';
    if (rememberCheckbox) rememberCheckbox.checked = false;
    
    showMessage('All account data cleared!', 'success');
}

// Logout function (for use in other pages)
function logoutUser() {
    clearCurrentUser();
    showMessage('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Check if user is already logged in (redirect if yes)
function checkExistingLogin() {
    const isLoggedIn = getCookie('is_logged_in');
    const currentUser = getCookie('current_user');
    
    if (isLoggedIn === 'true' && currentUser) {
        const user = JSON.parse(currentUser);
        showMessage(`You're already logged in as ${user.fullName}. Redirecting to home...`, 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return true;
    }
    return false;
}

// Get account statistics
function getAccountStats(username) {
    const data = getAccountSpecificData(username);
    if (!data) return null;
    
    return {
        loginCount: data.loginCount || 0,
        lastLogin: data.lastLogin,
        preferences: data.preferences,
        loginHistory: data.loginHistory || []
    };
}

// Initialize everything when DOM is loaded
function initializeEnhancedLogin() {
    // Check if user is already logged in first
    if (checkExistingLogin()) {
        return; // Stop initialization if redirecting
    }
    
    // Load saved credentials
    loadSavedCredentials();
    
    // Setup form submission
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', handleFormSubmission);
    }
    
    // Setup password toggle
    setupPasswordToggle();
    
    // Make functions available globally
    window.clearAllAccountData = clearAllAccountData;
    window.logoutUser = logoutUser;
    window.getCurrentUser = getCurrentUser;
    window.getAccountStats = getAccountStats;
    window.demoAccounts = demoAccounts;
    
    console.log('Enhanced login system initialized!');
    console.log('Demo accounts available:', Object.keys(demoAccounts));
    console.log('Available functions: clearAllAccountData(), logoutUser(), getCurrentUser(), getAccountStats()');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancedLogin);
} else {
    initializeEnhancedLogin();
}