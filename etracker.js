#!/usr/bin/env node
import process from 'process';
import fs from 'fs';

const expenses = loadExpenses();
let expenseIDCounter = getNextExpenseID();
let args = process.argv.slice(2);
let command = args[0];
let payload = args.slice(1).join(' ').trim();

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

switch (command) {
    case 'add':
        addCommand();
        break;
    case 'update':
        updateCommand();
        break;
    case 'delete':
        deleteCommand();
        break;
    case 'list':
        showExpensesList();
        break;
    case 'summary':
        summaryCommand();
        break;
    case 'help':
        showHelp();
        break;
    case 'export':
        exportToJSON();
        break;
    default:
        console.log('Unknown command. See help for more information.');
        break;
}

function addCommand() {
    if (payload) {
        const descriptionMatch = payload.match(/--description\s+([^-]+)/);
        const amountMatch = payload.match(/--amount\s+(\d+)/);
        const categoryMatch = payload.match(/--category\s+([^-]+)/)
        if (amountMatch) {
            const description = descriptionMatch ? descriptionMatch[1].trim() : '';
            const amount = parseFloat(amountMatch[1]);
            const category = categoryMatch ? categoryMatch[1].trim() : '';
            addExpense(description, amount, category);
        } else {
            console.log('You must at least write an amount of an expense!');
        }
    } else {
        console.log('Invalid format. add --description Tea --amount 20 --category Drinks');
    }
}

function updateCommand() {
    if (payload) {
        const expenseIDMatch = payload.match(/--id\s+(\d+)/);
        const descriptionMatch = payload.match(/--description\s+([^-]+)/);
        const amountMatch = payload.match(/--amount\s+(\d+)/);
        const categoryMatch = payload.match(/--category\s+([^-]+)/);
        if (expenseIDMatch && (descriptionMatch || amountMatch)) {
            const expenseID = Number(expenseIDMatch[1]);
            const description = descriptionMatch ? descriptionMatch[1].trim() : '';
            const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
            const category = categoryMatch ? categoryMatch[1].trim() : '';
            updateExpense(expenseID, description, amount, category);
        }
    } else {
        console.log('Invalid format. update 1 --description Pay a fee --amount 5 --category Administrative');
    }
}

function deleteCommand() {
    if (payload) {
        const expenseIDMatch = payload.match(/--id\s(\d+)/);
        if (expenseIDMatch) {
            const expenseID = Number(expenseIDMatch[1]);
            deleteExpense(expenseID);
        } else {
            console.log('Invalid format. delete --id 1');
        }
    }
}

function summaryCommand() {
    if (!payload) {
        showAllSummary();
        return;
    } 
    const monthMatch = payload.match(/--month\s(\d+)/);
    const categoryMatch = payload.match(/--category\s+(.+)/);
    if(monthMatch) {
        const month = Number(monthMatch[1]);
        showMonthSummary(month);
    } else if (categoryMatch){
        const category = categoryMatch[1].trim();
        showCategorySummary(category);
    } else {
        console.log('Invalid format. summary --month 7')
    }
}

function loadExpenses() {
    try {
        const data = fs.readFileSync('expenses.csv', 'utf8');
        const lines = data.trim().split('\n');

        const expenses = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
                id: parseInt(values[0]),
                description: values[1],
                amount: parseFloat(values[2]),
                category: values[3],
                createdAt: values[4],
                updatedAt: values[5]
            }
        });
        return expenses;
    } catch (err) {
        return [];
    }
}

function getNextExpenseID() {
    if (expenses.length === 0) return 1;
    return Math.max(...expenses.map(expense => expense.id)) + 1;
}

function addExpense(description, amount, category) {
    if(amount <= 0) {
        console.log("You can't add an expense with a negative number or that equals to zero!");
        return;
    }
    let now = new Date();
    const expense = {
        id: expenseIDCounter++,
        description: description,
        amount: amount,
        category: category,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
    }
    expenses.push(expense);
    writeToFile();
    console.log(`Expense added successfully (ID: ${expenseIDCounter - 1})`);
}

function updateExpense(expenseID, description, amount, category) {
    const index = expenses.findIndex(expense => expense.id === expenseID);
    if (index !== -1) {
        const expenseToUpdate = expenses[index];
        expenseToUpdate.description = description !== '' ? description : expenseToUpdate.description;
        expenseToUpdate.amount = amount !== null ? amount : expenseToUpdate.amount;
        expenseToUpdate.category = category !== null ? category : expenseToUpdate.category;
        expenseToUpdate.updatedAt = new Date().toISOString();
        expenses.splice(index, 1, expenseToUpdate);
        writeToFile();
        console.log(`You updated the expense with ID ${expenseID}`);
    } else {
        console.log(`Expense with ID ${expenseID} not found!`);
    }
}

function deleteExpense(expenseID) {
    const index = expenses.findIndex(expense => expense.id === expenseID);
    if (index !== -1) {
        expenses.splice(index, 1);
        writeToFile();
        console.log(`Expense deleted successfully (ID: ${expenseID})`);
    } else {
        console.log(`Expense with ID ${expenseID} not found!`);
    }
}

function showExpensesList() {
    if(expenses.length === 0) {
        console.log('Your current expense list is empty. Try adding one using add command!');
        return;
    }
    console.log(
        `${"ID".padEnd(4)}${"Date".padEnd(13)}${"Description".padEnd(18)}${"Amount".padEnd(12)}${"Category".padEnd(12)}`
    );
    expenses.forEach(expense => {
        const date = expense.createdAt.split('T')[0];
        const id = String(expense.id).padEnd(4);
        const description = expense.description.padEnd(18);
        const amount = (`$${expense.amount}`).padEnd(12);
        const category = expense.category.padEnd(12);
        console.log(`${id}${date.padEnd(13)}${description}${amount}${category}`)
    });
}

function showAllSummary() {
    let sum = 0;
    expenses.forEach(expense => sum += expense.amount);
    console.log(`Total expenses: $${sum}`);
}

function showMonthSummary(month) {
    if(month < 1 && month > 12) {
        console.log("You can't see a total for non existing month. Try entering month in range 1-12!")
    }
    const monthStr = month.toString().padStart(2, '0');
    const monthName = monthNames[month - 1];
    const filteredExpenses = expenses.filter(expense => {
        const expenseMonth = expense.createdAt.split('T')[0].split('-')[1];
        return monthStr === expenseMonth;
    });
    if (filteredExpenses.length === 0) {
        console.log(`No expenses found for ${monthName}!`);
        return;
    }
    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    console.log(`Total expenses for ${monthName}: $${total}`);
}

function showCategorySummary(category) {
    const filteredExpenses = expenses.filter(expense => {
        const expenseCategory = expense.category;
        return category === expenseCategory;
    });
    if (filteredExpenses.length === 0) {
        console.log(`No expenses found for category ${category}!`);
        return;
    }
    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    console.log(`Total expenses for category ${category}: $${total}`);
}

function writeToFile() {
    try {
        const headers = 'id,description,amount,category,createdAt,updatedAt';
        const rows = expenses.map(expense => {
            return `${expense.id},${expense.description},${expense.amount},${expense.category},${expense.createdAt},${expense.updatedAt}`;
        });
        const content = headers + '\n' + rows.join('\n');
        fs.writeFileSync('expenses.csv', content, 'utf8');
    } catch (err) {
        console.error('Error writing to expenses.csv:', err);
    }
}

function exportToJSON() {
    try {
        fs.writeFileSync('expenses.json', JSON.stringify(expenses, null, 2), 'utf8');
        console.log('Export to expenses.json was done successfully!');
    } catch (err) {
        console.error('Error writing to expenses.json:', err);
    }
}

function showHelp() {
    console.log(`Expense tracker CLI - Supported Commands
        
Usage:
    etracker <command> [options]
    
Commands:

    add                         Add a new expense
      --description <text>        Description of the expense
      --amount <number>           Expense amount
      --category <text>           Expense category
    
      Example:
      etracker add --description Tea --amount 10 --category Drinks
      

    update --id <id>             Update an existing expense by ID
      --description <text>        (Optional) New description
      --amount <number>           (Optional) New amount
      --category <text>           (Optional) New category
    
      Example:
      etracker update 1 --description Pay a fee --amount 5 --category Admin
     
      
    delete --id <id>              Delete an expense by ID
    
      Example:
      etracker delete 1
     
      
    list                       List all expenses
    
      Example:
      etracker list
    

    summary                    Show total of all expenses
    
      Example:
      etracker summary
      

    summary --month <1-12>     Show total expenses for a specific month
    
      Example:
      etracker summary --month 7
      

    summary --category <text>  Show total expenses for a category
    
      Example:
      etracker summary --category Food
      
      
    export                     Export all expenses to a JSON file
    
      Example:
      etracker export
      
      
    help                       Show this help message
    
      Example:
      etracker help
      
      
    - Dates are recorded automatically at the time of entry.`);
}