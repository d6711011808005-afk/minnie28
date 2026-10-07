import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Transaction, MonthlyBudgetSettings } from '../types';

export const transactionService = {
  // Listen to all transactions of a user in real-time
  subscribeUserTransactions(
    userId: string,
    onData: (transactions: Transaction[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    const colPath = `users/${userId}/transactions`;
    const colRef = collection(db, 'users', userId, 'transactions');
    const q = query(colRef, orderBy('date', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            userId: data.userId || userId,
            type: data.type,
            amount: Number(data.amount) || 0,
            category: data.category || 'อื่นๆ',
            date: data.date,
            note: data.note || '',
            paymentMethod: data.paymentMethod || 'transfer',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        onData(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, colPath);
        } catch (wrappedErr) {
          if (onError && wrappedErr instanceof Error) {
            onError(wrappedErr);
          }
        }
      }
    );
  },

  // Add a new transaction
  async addTransaction(userId: string, item: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const colPath = `users/${userId}/transactions`;
    try {
      const colRef = collection(db, 'users', userId, 'transactions');
      const docRef = doc(colRef);
      const newId = docRef.id;
      const nowIso = new Date().toISOString();

      const payload: Transaction = {
        id: newId,
        userId,
        type: item.type,
        amount: Number(item.amount),
        category: item.category,
        date: item.date,
        note: item.note?.trim() || '',
        paymentMethod: item.paymentMethod || 'transfer',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await setDoc(docRef, payload);
      return newId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, colPath);
      throw error;
    }
  },

  // Update existing transaction
  async updateTransaction(userId: string, transactionId: string, updates: Partial<Transaction>): Promise<void> {
    const docPath = `users/${userId}/transactions/${transactionId}`;
    try {
      const docRef = doc(db, 'users', userId, 'transactions', transactionId);
      const cleanedUpdates = {
        ...updates,
        amount: updates.amount !== undefined ? Number(updates.amount) : undefined,
        updatedAt: new Date().toISOString(),
      };
      // remove undefined values
      Object.keys(cleanedUpdates).forEach((key) => {
        if ((cleanedUpdates as Record<string, unknown>)[key] === undefined) {
          delete (cleanedUpdates as Record<string, unknown>)[key];
        }
      });

      await updateDoc(docRef, cleanedUpdates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  },

  // Delete transaction
  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    const docPath = `users/${userId}/transactions/${transactionId}`;
    try {
      const docRef = doc(db, 'users', userId, 'transactions', transactionId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  // Get user budget settings
  async getUserBudget(userId: string): Promise<number> {
    const docPath = `users/${userId}/profile/settings`;
    try {
      const docRef = doc(db, 'users', userId, 'profile', 'settings');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return Number(data.monthlyBudget) || 20000;
      }
      return 20000;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath);
      return 20000;
    }
  },

  // Save user budget settings
  async setUserBudget(userId: string, budget: number, email?: string, displayName?: string): Promise<void> {
    const docPath = `users/${userId}/profile/settings`;
    try {
      const docRef = doc(db, 'users', userId, 'profile', 'settings');
      const payload: MonthlyBudgetSettings = {
        userId,
        monthlyBudget: Math.max(0, budget),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },
};
