
'use client'

import * as React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSecurity } from '@/context/security-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'
import { PageGuard } from '@/components/security/page-guard'

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'sales', label: 'Sales' },
  { id: 'customers', label: 'Customers' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'purchases', label: 'Purchases' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'finance', label: 'Finance' },
  { id: 'reports', label: 'Reports' },
  { id: 'admin', label: 'Admin Panel' },
  { id: 'settings', label: 'Settings' },
]

const formSchema = z.object({
  password: z.string().min(4, 'Password must be at least 4 characters.'),
})

interface TabSecurityFormProps {
  tabId: string
  tabLabel: string
}

function TabSecurityForm({ tabId, tabLabel }: TabSecurityFormProps) {
  const { lockTab, removeLock, lockedTabs } = useSecurity()
  const { toast } = useToast()
  const isLocked = lockedTabs.hasOwnProperty(tabId)
  const [isEnabled, setIsEnabled] = React.useState(isLocked)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '' },
  })

  React.useEffect(() => {
    setIsEnabled(lockedTabs.hasOwnProperty(tabId));
  }, [lockedTabs, tabId]);
  
  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked)
    if (!checked) {
      removeLock(tabId)
      form.reset()
      toast({ title: `Security disabled for ${tabLabel}` })
    }
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    lockTab(tabId, values.password)
    toast({ title: `Password set for ${tabLabel}` })
    form.reset()
  }

  return (
    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 rounded-lg border p-4">
      <div className="space-y-0.5">
        <h3 className="font-medium">{tabLabel}</h3>
        <p className="text-sm text-muted-foreground">
          {isLocked
            ? 'Security is enabled and password is set.'
            : isEnabled
            ? 'Security is enabled. Set a password.'
            : 'Security is disabled.'}
        </p>
      </div>
      <div className="w-full sm:w-auto flex flex-col items-end gap-4">
        <Switch checked={isEnabled} onCheckedChange={handleToggle} />
        {isEnabled && !isLocked && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <Button type="submit">Set Password</Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  )
}


function SettingsPageContent() {
    return (
        <div className="flex flex-col gap-8">
            <div className="text-left">
                <h1 className="text-3xl font-bold font-headline">
                Settings
                </h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                Manage your application settings and security preferences.
                </p>
            </div>

            <Card>
                <CardHeader>
                <CardTitle>Tab Security</CardTitle>
                <CardDescription>
                    Set a password to restrict access to specific tabs. Once set, a password cannot be changed, only removed by disabling security for that tab.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {tabs.map(tab => (
                        <TabSecurityForm key={tab.id} tabId={tab.id} tabLabel={tab.label} />
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

export default function SettingsPage() {
    return (
        <PageGuard tabId="settings">
            <SettingsPageContent />
        </PageGuard>
    )
}
