'use client';

import type { Transaction } from '@/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, DownloadIcon } from 'lucide-react';
import { format, isValid, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ReportExporterProps {
  transactions: Transaction[];
}

// Extend jsPDF with autoTable - this is a common way to type it for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function ReportExporter({ transactions }: ReportExporterProps) {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const handleExport = () => {
    if (!dateRange.from || !isValid(dateRange.from) || !dateRange.to || !isValid(dateRange.to)) {
      toast({ title: 'Error', description: 'Please select a valid date range.', variant: 'destructive' });
      return;
    }

    const filteredTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= dateRange.from! && txDate <= dateRange.to!;
    });

    if (filteredTransactions.length === 0) {
      toast({ title: 'No Data', description: 'No transactions found in the selected date range.', variant: 'default' });
      return;
    }

    try {
      const doc = new jsPDF();
      
      // It's good practice to embed fonts if PT Sans is crucial for the PDF look
      // For simplicity, we'll rely on system fonts or jsPDF defaults.
      // If PT Sans is available as a standard font in jsPDF or if you load it, set it:
      // doc.setFont('PT Sans', 'normal'); // May require font files or specific jsPDF setup

      doc.setFontSize(18);
      doc.text('Kesi Ledger - Transaction Report', 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100); // Gray color for subtitle
      doc.text(`Report for: ${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`, 14, 30);

      const tableColumn = ["Date", "Type", "Description", "Category", "Name", "Phone", "Method", "Amount"];
      const tableRows: any[][] = [];

      filteredTransactions.forEach(tx => {
        const transactionData = [
          format(new Date(tx.date), 'yyyy-MM-dd'), // Ensure date is correctly formatted
          tx.type,
          tx.description,
          tx.category,
          tx.name,
          tx.phoneNumber,
          tx.paymentMethod,
          `${tx.type === 'expense' ? '-' : ''}${tx.amount.toFixed(2)}`
        ];
        tableRows.push(transactionData);
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'striped', 
        headStyles: { 
          fillColor: [204, 0, 0], // Red HSL(0, 80%, 40%) approx
          textColor: [255, 255, 255] 
        },
        styles: { cellPadding: 2, fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 25 }, // Date
          2: { cellWidth: 40 }, // Description
          7: { halign: 'right' } // Amount
        }
      });
      
      doc.save(`Kesi_Ledger_Report_${format(dateRange.from, 'yyyyMMdd')}_${format(dateRange.to, 'yyyyMMdd')}.pdf`);
      toast({ title: 'Success', description: 'Report generated and download started.' });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: 'Error', description: 'Failed to generate PDF report.', variant: 'destructive' });
    }
  };

  return (
    <Card className="shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Export Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="fromDate">From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="fromDate"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal mt-1',
                    !dateRange.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from && isValid(dateRange.from) ? format(dateRange.from, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, from: date || undefined }))}
                  initialFocus
                  disabled={(date) => dateRange.to ? date > dateRange.to : false}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="toDate">To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="toDate"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal mt-1',
                    !dateRange.to && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to && isValid(dateRange.to) ? format(dateRange.to, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, to: date || undefined }))}
                  disabled={(date) => dateRange.from ? date < dateRange.from : false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Button onClick={handleExport} className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
          <DownloadIcon className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </CardContent>
    </Card>
  );
}
