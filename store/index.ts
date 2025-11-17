import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface ExpenseSplit {
  personId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  time: string;
  category: string;
  tag: string;
  intent: string;
  splits: ExpenseSplit[];
  paidBy: string;
}

interface AppState {
  people: Person[];
  expenses: Expense[];
  addPerson: (person: Person) => void;
  removePerson: (id: string) => void;
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  loadData: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  people: [],
  expenses: [],
  
  addPerson: (person) => set((state) => {
    const newPeople = [...state.people, person];
    AsyncStorage.setItem('people', JSON.stringify(newPeople));
    return { people: newPeople };
  }),
  
  removePerson: (id) => set((state) => {
    const newPeople = state.people.filter(p => p.id !== id);
    AsyncStorage.setItem('people', JSON.stringify(newPeople));
    return { people: newPeople };
  }),
  
  addExpense: (expense) => set((state) => {
    const newExpenses = [...state.expenses, expense];
    AsyncStorage.setItem('expenses', JSON.stringify(newExpenses));
    return { expenses: newExpenses };
  }),
  
  deleteExpense: (id) => set((state) => {
    const newExpenses = state.expenses.filter(e => e.id !== id);
    AsyncStorage.setItem('expenses', JSON.stringify(newExpenses));
    return { expenses: newExpenses };
  }),
  
  loadData: async () => {
    try {
      const peopleData = await AsyncStorage.getItem('people');
      const expensesData = await AsyncStorage.getItem('expenses');
      
      set({
        people: peopleData ? JSON.parse(peopleData) : [],
        expenses: expensesData ? JSON.parse(expensesData) : [],
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  },
}));