# 📕 Expense Tracker CLI

a lightweight command-line tool to track personal expenses using CSV files. add, update, list, summarize, and export your expenses right from the terminal.

## 📦 Installation
```
git clone https://github.com/trenter39/expensetracker.git
cd expensetracker
npm install -g
```
now you can use `etracker` from anywhere in your terminal.

## 🛠️ Usage

### ➕ Add an expense
```
etracker add --description Tea --amount 10 --category Drinks
```

### 🛠 Update an expense
```
etracker update 1 --description Coffee --amount 15 --category Beverages
```

### 🗑 Delete an expense
```
etracker delete --id 1
```

### 📋 List all expenses
```
etracker list
```

### 📈 Show summary
**Total**
```
etracker summary
```
**By month**
```
etracker summary --month 7
```
**By category**
```
etracker summary --category Drinks
```

### 📤 Export to JSON
```
etracker export
```

### 🆘 Help
```
etracker help
```

## 🗃 Data Format

each expense is saved in `expenses.csv` with this structure:
```
id,description,amount,category,createdAt,updatedAt
1,Tea,20,Drinks,2025-07-12T11:29:00.241Z,2025-07-12T11:29:00.241Z
```