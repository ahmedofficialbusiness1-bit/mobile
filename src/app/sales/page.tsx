
'use client'

import * as React from 'react'
import { PageGuard } from '@/components/security/page-guard'
import SalesPageContent from './sales-page-content'

export default function SalesPage() {
    return (
        <PageGuard tabId="sales">
            <SalesPageContent />
        </PageGuard>
    )
}
