# Expense Tracker

a lightweight command-line tool to track personal expenses using CSV files. add, update, list, summarize, and export to JSON your expenses right from the terminal.

## Installation
```
git clone https://github.com/trenter39/expensetracker.git
cd expensetracker
npm install -g
```
now you can use `etracker` from anywhere in your terminal.

## Data Format

each expense is saved in `expenses.csv` with this structure:
```
id,description,amount,category,createdAt,updatedAt
1,Tea,20,Drinks,2025-07-12T11:29:00.241Z,2025-07-12T11:29:00.241Z
```

![expense tracker preview](https://github.com/trenter39/expensetracker/blob/master/preview.png)