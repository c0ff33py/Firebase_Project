
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { loadServiceFeeRate, saveServiceFeeRate } from '@/lib/localStorageHelper';
import { Settings, Percent } from 'lucide-react';

export function ServiceFeeSettings() {
  const [feeRate, setFeeRate] = useState<string>(() => loadServiceFeeRate().toString());
  const { toast } = useToast();

  useEffect(() => {
    // Load rate from localStorage when component mounts
    setFeeRate(loadServiceFeeRate().toString());
  }, []);

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeeRate(e.target.value);
  };

  const handleSaveRate = () => {
    const rate = parseFloat(feeRate);
    if (isNaN(rate) || rate < 0) {
      toast({
        title: 'Invalid Rate',
        description: 'Please enter a valid non-negative number for the fee rate.',
        variant: 'destructive',
      });
      return;
    }
    saveServiceFeeRate(rate);
    toast({
      title: 'Success',
      description: `Service fee rate updated to ${rate}%.`,
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Service Fee Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="feeRate" className="text-sm">
            Service Fee Rate (%)
          </Label>
          <div className="flex items-center mt-1">
            <Input
              id="feeRate"
              type="number"
              value={feeRate}
              onChange={handleRateChange}
              placeholder="e.g., 1"
              className="flex-grow"
              min="0"
              step="0.01"
            />
            <Percent className="ml-2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <Button onClick={handleSaveRate} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Save Rate
        </Button>
      </CardContent>
    </Card>
  );
}
