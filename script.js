let transactions = JSON.parse(localStorage.getItem('pappuTransactions')) || [];
let filterMonth = null;

// Load data and check dark mode preference
window.onload = function() {
    document.getElementById('date').valueAsDate = new Date();
    displayTransactions();
    updateSummary();
    loadDarkModePreference();
};

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    
    const isDark = document.body.classList.contains('dark-mode');
    const btn = document.getElementById('darkModeToggle');
    btn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    btn.className = isDark ? 'dark-mode-btn light-toggle' : 'dark-mode-btn';
    
    localStorage.setItem('darkMode', isDark);
}

function loadDarkModePreference() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        toggleDarkMode();
    }
}

function addTransaction() {
    const type = document.getElementById('transaction-type').value;
    const desc = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    
    if (!desc || isNaN(amount) || amount <= 0) {
        alert('Please fill all fields with valid amount');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        type,
        desc,
        amount,
        category,
        date: new Date(date).toLocaleDateString('en-IN')
    };
    
    transactions.unshift(transaction);
    localStorage.setItem('pappuTransactions', JSON.stringify(transactions));
    
    displayTransactions();
    updateSummary();
    clearForm();
}

function displayTransactions() {
    const tbody = document.getElementById('transaction-list');
    tbody.innerHTML = '';
    
    let filtered = transactions;
    if (filterMonth !== null) {
        filtered = transactions.filter(t => {
            const transDate = new Date(t.date.split('/').reverse().join('-'));
            return transDate.getMonth() === filterMonth && 
                   transDate.getFullYear() === new Date().getFullYear();
        });
    }
    
    filtered.slice(0, 100).forEach(transaction => {  // Limit to recent 100
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.desc}</td>
            <td>${transaction.category}</td>
            <td class="${transaction.type}">${transaction.type === 'income' ? '+' : '-' }₹${transaction.amount.toFixed(2)}</td>
            <td><button class="delete-btn" onclick="deleteTransaction(${transaction.id})">Delete</button></td>
        `;
    });
}

function updateSummary() {
    let totalIncome = 0, totalExpenses = 0, monthExpenses = 0;
    
    transactions.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        else totalExpenses += t.amount;
    });
    
    if (filterMonth !== null) {
        transactions.forEach(t => {
            const transDate = new Date(t.date.split('/').reverse().join('-'));
            if (transDate.getMonth() === filterMonth && 
                transDate.getFullYear() === new Date().getFullYear() && 
                t.type === 'expense') {
                monthExpenses += t.amount;
            }
        });
    } else {
        monthExpenses = totalExpenses;
    }
    
    const balance = totalIncome - totalExpenses;
    const balanceEl = document.getElementById('balance-display');
    balanceEl.textContent = `₹${balance.toFixed(2)}`;
    balanceEl.className = balance >= 0 ? 'positive' : 'negative';
    
    document.getElementById('total-income').textContent = `₹${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `₹${totalExpenses.toFixed(2)}`;
    document.getElementById('month-expenses').textContent = `₹${monthExpenses.toFixed(2)}`;
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('pappuTransactions', JSON.stringify(transactions));
    displayTransactions();
    updateSummary();
}

function filterCurrentMonth() {
    filterMonth = new Date().getMonth();
    setActiveFilter('monthBtn');
    displayTransactions();
    updateSummary();
}

function showAll() {
    filterMonth = null;
    setActiveFilter('allBtn');
    displayTransactions();
    updateSummary();
}

function setActiveFilter(activeId) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
}

function clearAllData() {
    if (confirm('Delete all Pappu Sarkar\'s transactions? Cannot be undone.')) {
        transactions = [];
        localStorage.removeItem('pappuTransactions');
        displayTransactions();
        updateSummary();
    }
}

function exportData() {
    const csv = ['Date,Description,Category,Amount,Type\n'];
    transactions.forEach(t => {
        csv.push(`${t.date},"${t.desc}",${t.category},${t.amount},${t.type}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pappu_Sarkar_Expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

function clearForm() {
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('category').value = 'Food';
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('transaction-type').value = 'expense';
}
