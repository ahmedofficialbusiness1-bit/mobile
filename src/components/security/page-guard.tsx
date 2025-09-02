
'use client'

import * as React from 'react'

interface PageGuardProps {
  children: React.ReactNode
}

export function PageGuard({ children }: PageGuardProps) {
  return <>{children}</>
}
