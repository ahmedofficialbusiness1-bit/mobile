
'use client'

import * as React from 'react'
import { useAuth } from '@/context/auth-context';
import DashboardPageContent from './dashboard-content';
import { PageGuard } from '@/components/security/page-guard';

export default function DashboardPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
         <div className="flex items-center justify-center h-full">
            <div className="text-xl font-semibold">Loading Dashboard...</div>
         </div>
       );
    }
    
    if (!user) {
        // This should theoretically not be reached due to AuthProvider redirects,
        // but it's good practice for robustness.
        return null;
    }

    return (
        <PageGuard tabId="dashboard">
            <DashboardPageContent />
        </PageGuard>
    );
}
