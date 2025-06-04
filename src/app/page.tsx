'use client';

import type { Transaction } from '@/types';
import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { BalanceSummary } from '@/components/BalanceSummary';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { ReportExporter } from '@/components/ReportExporter';
import { loadTransactions, saveTransactions } from '@/lib/localStorageHelper';
import { Skeleton } from '@/components/ui/skeleton';


export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedRowId, setAnimatedRowId] = useState<string | null>(null);

  useEffect(() => {
    // Ensures this runs only on the client
    if (typeof window !== 'undefined') {
      const loadedTransactions = loadTransactions();
      setTransactions(loadedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      saveTransactions(transactions);
    }
  }, [transactions, isLoading]);
  
  useEffect(() => {
    if (animatedRowId) {
      const timer = setTimeout(() => setAnimatedRowId(null), 1000); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [animatedRowId]);


  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  if (isLoading && typeof window !== 'undefined') { // Show skeleton loader only on client during initial load
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-8">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-[600px] w-full rounded-lg" />
            </div>
            <div className="md:col-span-2 space-y-8">
              <Skeleton className="h-[500px] w-full rounded-lg" />
              <Skeleton className="h-[250px] w-full rounded-lg" />
            </div>
          </div>
        </main>
         <footer className="py-6 text-center text-muted-foreground border-t border-border mt-auto">
          <p>&copy; {new Date().getFullYear()} c0ff33 Leger. All rights reserved.</p>
        </footer>
      </div>
    );
  }
  
  // Fallback for SSR or if window is not defined yet, can be an empty state or minimal loader
  if (typeof window === 'undefined') {
     return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-8">
           <div className="flex items-center justify-center h-64">
            <p className="text-xl text-muted-foreground">Initializing c0ff33 Leger...</p>
          </div>
        </main>
         <footer className="py-6 text-center text-muted-foreground border-t border-border mt-auto">
          <p>&copy; {new Date().getFullYear()} c0ff33 Leger. All rights reserved.</p>
        </footer>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left Column: Form and Balance */}
          <div className="md:col-span-1 space-y-8 flex flex-col">
            <BalanceSummary transactions={transactions} />
            <TransactionForm onAddTransaction={handleAddTransaction} animateTrigger={setAnimatedRowId} />
          </div>

          {/* Right Column: History and Export */}
          <div className="md:col-span-2 space-y-8 flex flex-col">
            <TransactionList transactions={transactions} animatedRowId={animatedRowId} />
            <ReportExporter transactions={transactions} />
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-muted-foreground border-t border-border mt-auto">
        <p>&copy; {new Date().getFullYear()} c0ff33 Leger. All rights reserved.</p>
      </footer>
    </div>
  );
}
