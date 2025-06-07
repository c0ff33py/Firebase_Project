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

  const getEffectiveAmount = (t: Transaction) => {
    if (t.type === 'income') {
      return t.amount - (t.serviceFee || 0);
    }
    return t.amount + (t.serviceFee || 0);
  };

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
      
      doc.setFontSize(18);
      doc.text('c0ff33 Leger - Transaction Report', 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Report for: ${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`, 14, 30);

      const tableColumn = ["Date", "Type", "Description", "Category", "Name", "Phone", "Method", "Amount", "Service Fee", "Net/Total"];
      const tableRows: any[][] = [];

      filteredTransactions.forEach(tx => {
        const transactionData = [
          format(new Date(tx.date), 'yyyy-MM-dd'),
          tx.type,
          tx.description,
          tx.category,
          tx.name,
          tx.phoneNumber,
          tx.paymentMethod,
          tx.amount.toFixed(2),
          (tx.serviceFee || 0).toFixed(2),
          getEffectiveAmount(tx).toFixed(2)
        ];
        tableRows.push(transactionData);
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'striped', 
        headStyles: { 
          fillColor: [204, 0, 0], 
          textColor: [255, 255, 255] 
        },
        styles: { cellPadding: 1.5, fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 18 }, // Date
          2: { cellWidth: 30 }, // Description
          7: { halign: 'right', cellWidth: 15 }, // Amount
          8: { halign: 'right', cellWidth: 15 }, // Service Fee
          9: { halign: 'right', cellWidth: 18 }  // Net/Total
        }
      });
      
      doc.save(`c0ff33_Leger_Report_${format(dateRange.from, 'yyyyMMdd')}_${format(dateRange.to, 'yyyyMMdd')}.pdf`);
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
