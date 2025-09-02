
'use client'

import * as React from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import ShopsSettings from './shops-settings'


function SettingsPageContent() {
    return (
        <div className="flex flex-col gap-8">
            <div className="text-left">
                <h1 className="text-3xl font-bold font-headline">
                Settings
                </h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                Manage your application settings and shops.
                </p>
            </div>

            <Tabs defaultValue="shops" className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="shops">Shops & Branches</TabsTrigger>
                </TabsList>
                <TabsContent value="shops">
                    <ShopsSettings />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default function SettingsPage() {
    return (
        <SettingsPageContent />
    )
}
