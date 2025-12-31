// Application State
let currentUser = null;
let expenses = [];
let monthlyChart = null;
let categoryChart = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

// Initialize App
function initializeApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expense-date').value = today;
    
    // Set default month filter to current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    document.getElementById('month-filter').value = currentMonth;
}

// Setup Event Listeners
function setupEventListeners() {
    // Auth tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });

    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Expense form
    document.getElementById('expense-form').addEventListener('submit', handleAddExpense);
    
    // Month filter
    document.getElementById('month-filter').addEventListener('change', handleMonthFilter);
    document.getElementById('view-all-btn').addEventListener('click', handleViewAll);
}

// Check Authentication Status
function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        currentUser = user;
        loadUserData();
        showDashboard();
    } else {
        showAuth();
    }
}

// Switch Auth Tabs
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
    clearAuthMessage();
}

// Clear Auth Message
function clearAuthMessage() {
    const messageEl = document.getElementById('auth-message');
    messageEl.textContent = '';
    messageEl.className = 'message';
}

// Show Message
function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    setTimeout(() => {
        messageEl.textContent = '';
        messageEl.className = 'message';
    }, 3000);
}

// Handle Register
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        showMessage('auth-message', 'User with this email already exists!', 'error');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In production, hash the password
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Set current user
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    // Initialize user expenses
    localStorage.setItem(`expenses_${newUser.id}`, JSON.stringify([]));

    showMessage('auth-message', 'Registration successful! Redirecting...', 'success');
    setTimeout(() => {
        loadUserData();
        showDashboard();
    }, 1000);
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        showMessage('auth-message', 'Invalid email or password!', 'error');
        return;
    }

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    showMessage('auth-message', 'Login successful! Redirecting...', 'success');
    setTimeout(() => {
        loadUserData();
        showDashboard();
    }, 1000);
}

// Handle Logout
function handleLogout() {
    currentUser = null;
    expenses = [];
    localStorage.removeItem('currentUser');
    showAuth();
    clearCharts();
}

// Show Auth Section
function showAuth() {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    clearAuthMessage();
}

// Show Dashboard
function showDashboard() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('user-name').textContent = currentUser.name;
    updateDashboard();
}

// Load User Data
function loadUserData() {
    const userExpenses = JSON.parse(localStorage.getItem(`expenses_${currentUser.id}`) || '[]');
    expenses = userExpenses.map(exp => ({
        ...exp,
        date: new Date(exp.date)
    }));
}

// Handle Add Expense
function handleAddExpense(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;
    const description = document.getElementById('expense-description').value.trim() || 'No description';

    const newExpense = {
        id: Date.now().toString(),
        amount,
        category,
        date: new Date(date).toISOString(),
        description,
        createdAt: new Date().toISOString()
    };

    expenses.push(newExpense);
    saveExpenses();
    document.getElementById('expense-form').reset();
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    
    updateDashboard();
    showMessage('auth-message', 'Expense added successfully!', 'success');
}

// Handle Delete Expense
function handleDeleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(exp => exp.id !== id);
        saveExpenses();
        updateDashboard();
    }
}

// Save Expenses
function saveExpenses() {
    localStorage.setItem(`expenses_${currentUser.id}`, JSON.stringify(expenses));
}

// Handle Month Filter
function handleMonthFilter() {
    updateDashboard();
}

// Handle View All
function handleViewAll() {
    document.getElementById('month-filter').value = '';
    updateDashboard();
}

// Update Dashboard
function updateDashboard() {
    updateSummary();
    updateCharts();
    updateExpensesList();
}

// Update Summary Cards
function updateSummary() {
    const monthFilter = document.getElementById('month-filter').value;
    let filteredExpenses = expenses;

    if (monthFilter) {
        const [year, month] = monthFilter.split('-');
        filteredExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getFullYear() == year && expDate.getMonth() + 1 == month;
        });
    }

    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
    const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const avgDaily = thisMonthTotal / daysInMonth;

    document.getElementById('total-expenses').textContent = `₹${total.toFixed(2)}`;
    document.getElementById('month-expenses').textContent = `₹${thisMonthTotal.toFixed(2)}`;
    document.getElementById('avg-daily').textContent = `₹${avgDaily.toFixed(2)}`;
    document.getElementById('total-transactions').textContent = filteredExpenses.length;
}

// Update Charts
function updateCharts() {
    updateMonthlyChart();
    updateCategoryChart();
}

// Update Monthly Chart
function updateMonthlyChart() {
    const ctx = document.getElementById('monthly-chart').getContext('2d');
    
    // Get last 6 months
    const months = [];
    const monthlyTotals = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        months.push(monthName);
        
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getFullYear() === year && expDate.getMonth() + 1 === month;
        });
        const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        monthlyTotals.push(total);
    }

    if (monthlyChart) {
        monthlyChart.destroy();
    }

    monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Monthly Expenses (₹)',
                data: monthlyTotals,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

// Update Category Chart
function updateCategoryChart() {
    const ctx = document.getElementById('category-chart').getContext('2d');
    
    const monthFilter = document.getElementById('month-filter').value;
    let filteredExpenses = expenses;

    if (monthFilter) {
        const [year, month] = monthFilter.split('-');
        filteredExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getFullYear() == year && expDate.getMonth() + 1 == month;
        });
    }

    // Calculate category totals
    const categoryTotals = {};
    filteredExpenses.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    // Color palette
    const colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
        '#10b981', '#3b82f6', '#ef4444', '#14b8a6'
    ];

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors.slice(0, categories.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Update Expenses List
function updateExpensesList() {
    const listContainer = document.getElementById('expenses-list');
    const monthFilter = document.getElementById('month-filter').value;
    
    let filteredExpenses = expenses;

    if (monthFilter) {
        const [year, month] = monthFilter.split('-');
        filteredExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getFullYear() == year && expDate.getMonth() + 1 == month;
        });
    }

    // Sort by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredExpenses.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <h3>No expenses found</h3>
                <p>Start tracking your expenses by adding a new expense above.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = filteredExpenses.map(expense => {
        const date = new Date(expense.date);
        const formattedDate = date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return `
            <div class="expense-item">
                <div class="expense-info">
                    <h3>${expense.category}</h3>
                    <p>${expense.description} • ${formattedDate}</p>
                </div>
                <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                <div class="expense-actions">
                    <button class="btn btn-danger" onclick="handleDeleteExpense('${expense.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Clear Charts
function clearCharts() {
    if (monthlyChart) {
        monthlyChart.destroy();
        monthlyChart = null;
    }
    if (categoryChart) {
        categoryChart.destroy();
        categoryChart = null;
    }
}

