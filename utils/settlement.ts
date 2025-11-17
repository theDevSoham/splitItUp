import { Expense, Person } from '../store';

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export function calculateSettlements(expenses: Expense[], people: Person[]): Settlement[] {
  // Calculate net balance for each person
  const balances: { [key: string]: number } = {};
  
  // Initialize balances
  people.forEach(person => {
    balances[person.id] = 0;
  });
  
  // Calculate who paid and who owes
  expenses.forEach(expense => {
    // Person who paid gets positive balance
    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
    
    // People who owe get negative balance
    expense.splits.forEach(split => {
      balances[split.personId] = (balances[split.personId] || 0) - split.amount;
    });
  });
  
  // Separate creditors and debtors
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];
  
  Object.entries(balances).forEach(([id, balance]) => {
    if (balance > 0.01) {
      creditors.push({ id, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ id, amount: -balance });
    }
  });
  
  // Minimize transactions using greedy algorithm
  const settlements: Settlement[] = [];
  
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    
    const amount = Math.min(creditor.amount, debtor.amount);
    
    if (amount > 0.01) {
      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(amount * 100) / 100,
      });
    }
    
    creditor.amount -= amount;
    debtor.amount -= amount;
    
    if (creditor.amount < 0.01) i++;
    if (debtor.amount < 0.01) j++;
  }
  
  return settlements;
}