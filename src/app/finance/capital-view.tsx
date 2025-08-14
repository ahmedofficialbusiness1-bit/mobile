
'use client'

import * as React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { PlusCircle, TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import { CapitalForm, type CapitalContribution } from './capital-form';
import { useToast } from '@/hooks/use-toast';

const initialContributions: CapitalContribution[] = [
  { id: 'cap-001', date: new Date(2023, 0, 15), description: 'Initial Capital Injection', type: 'Cash', amount: 25000000 },
  { id: 'cap-002', date: new Date(2023, 5, 10), description: 'Toyota Hilux van for delivery', type: 'Asset', amount: 15000000 },
  { id: 'cap-003', date: new Date(2024, 2, 1), description: 'Owner loan to business', type: 'Liability', amount: 5000000 },
];


export default function CapitalView() {
  const [contributions, setContributions] = React.useState<CapitalContribution[]>(initialContributions);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSaveCapital = (data: Omit<CapitalContribution, 'id'>) => {
    const newContribution: CapitalContribution = {
      id: `cap-${Date.now()}`,
      ...data,
    };
    setContributions(prev => [newContribution, ...prev]);
    toast({
      title: "Capital Introduced Successfully",
      description: `A new capital of TSh ${data.amount.toLocaleString()} has been recorded.`,
    });
    setIsFormOpen(false);
  };

  const totalCapital = contributions.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Capital Management</CardTitle>
            <CardDescription>Monitor owner's equity, investments, and drawings.</CardDescription>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Introduce New Capital
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount (TSh)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.length > 0 ? (
                  contributions.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">{format(item.date, 'PPP')}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="text-right font-mono">{item.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No capital contributions recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="font-bold text-lg">
                  <TableCell colSpan={3}>Total Contributed Capital</TableCell>
                  <TableCell className="text-right">
                    TSh {totalCapital.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
      <CapitalForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveCapital}
      />
    </>
  );
}
