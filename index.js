const storedData = JSON.parse(localStorage.getItem("transactions")) || [];
const transactions = storedData.map((item) => ({
  ...item,
  date: new Date(item.date),
}));

const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalExpense = document.getElementById('total-expense');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');

function generateId() {
  return Date.now() + Math.random().toString(36).substring(2, 15);
}

if (dateInput) {
  dateInput.defaultValue = new Date().toISOString().split("T")[0];
}


const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EGP',
  minimumFractionDigits: 2,
});

function formatCurrency(value) {
  if (value === 0) {
    return formatter.format(0).replace(/^[+-]/, "");
  }
  return formatter.format(value);
}

function updateTotalExpense() {
  const expenses = expenseList.getElementsByTagName('li');
  let total = 0;
  for (let expense of expenses) {
    total += parseFloat(expense.dataset.amount);
  }
  totalExpense.textContent = `Total Expense: ${formatCurrency(total)}`;
}

function addExpense(event) {
  event.preventDefault();
  const description = descriptionInput.value;
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;

  if (description && !isNaN(amount) && date) {
    const newTransaction = { 
      id: generateId(),
      description,
      amount: amount,
      date: new Date(date),
      type: "expense" 
    };
    
    const expenseItem = document.createElement('li');
    expenseItem.innerHTML = `
        <div class = "expense-item">
        <h2>${description}</h2>
        <p>${date}</p>
        </div>
        <div class="amount${amount < 0 ? ' negative' : ''}">${amount.toFixed(2)} EGP</div>
        <div class="action"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
         onclick="deleteExpense('${newTransaction.id}')" >
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
</div>
        `;
       
    expenseItem.dataset.amount = amount;
    expenseList.appendChild(expenseItem);
    descriptionInput.value = '';
    amountInput.value = '0';
    dateInput.value = new Date().toISOString().split("T")[0];
    
    transactions.push(newTransaction);
    saveTransactions();
    updateTotalExpense();
  }
}

function renderList() {
  expenseList.innerHTML = "";
  transactions.forEach((transaction) => {
    const expenseItem = document.createElement('li');

    const dateObj = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
    const isValid = !isNaN(dateObj.getTime());
    const dateText = isValid ? dateObj.toISOString().split('T')[0] : '';

    expenseItem.innerHTML = `
        <div class = "expense-item">
        <h2>${transaction.description}</h2>
        <p>${dateText}</p>
        </div>
        <div class="amount${transaction.amount < 0 ? ' negative' : ''}">${transaction.amount.toFixed(2)} EGP</div>
        <div class="action"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
         onclick="deleteExpense('${transaction.id}')" >
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
</div>
        `;
    expenseItem.dataset.amount = transaction.amount;
    expenseList.appendChild(expenseItem);
  });
}

function loadExpenses() {
  renderList();
}

function deleteExpense(id) {
  const index = transactions.findIndex((t) => t.id == id);
  if (index === -1) {
    alert("Transaction not found.");
    return false;
  }
  transactions.splice(index, 1);
  saveTransactions();
  renderList();
  updateTotalExpense();
  return true;
}

function addTransaction(formData, uniqueId, type = "expense") {
  const newTransaction = {
    id: uniqueId,
    description: formData.get("description"),
    amount: parseFloat(formData.get("amount")),
    date: new Date(formData.get("date")),
    type,
  };

  if (!newTransaction.description || isNaN(newTransaction.amount) || !newTransaction.date) {
    alert("Please fill in all fields correctly.");
    return null;
  }

  transactions.push(newTransaction);
  saveTransactions();

  return newTransaction;
}

function saveTransactions() {
  const transactionsToStore = transactions.map((item) => ({
    ...item,
    date: item.date.toISOString(),
  }));
  localStorage.setItem("transactions", JSON.stringify(transactionsToStore));
}

if (expenseForm) {
  expenseForm.addEventListener("submit", addExpense);
}

loadExpenses();
updateTotalExpense();