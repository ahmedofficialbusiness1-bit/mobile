
'use client'

import * as React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import { CapitalForm, type CapitalContribution } from './capital-form';
import { useToast } from '@/hooks/use-toast';
import { useFinancials } from '@/context/financial-context';


export default function CapitalView() {
  const { capitalContributions, addCapitalContribution } = useFinancials();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSaveCapital = (data: Omit<CapitalContribution, 'id' | 'userId' | 'shopId'>) => {
    addCapitalContribution(data);
    toast({
      title: "Capital Introduced Successfully",
      description: `A new capital of TSh ${data.amount.toLocaleString()} has been recorded.`,
    });
    setIsFormOpen(false);
  };

  const totalCapital = capitalContributions.reduce((sum, item) => sum + item.amount, 0);

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
                {capitalContributions.length > 0 ? (
                  capitalContributions.map(item => (
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
                      No capital contributions recorded yet for this shop.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="font-bold text-lg">
                  <TableCell colSpan={3}>Total Contributed Capital (This Shop)</TableCell>
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
