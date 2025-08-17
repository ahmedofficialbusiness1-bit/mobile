
'use client'

import * as React from 'react'
import { useSecurity } from '@/context/security-context'
import { PasswordPromptDialog } from './password-prompt-dialog'

interface PageGuardProps {
  tabId: string
  children: React.ReactNode
}

export function PageGuard({ tabId, children }: PageGuardProps) {
  const { isTabLocked, unlockTab, verifyPassword } = useSecurity()
  const [isLocked, setIsLocked] = React.useState(isTabLocked(tabId));
  const [showPrompt, setShowPrompt] = React.useState(isTabLocked(tabId));

  React.useEffect(() => {
      const locked = isTabLocked(tabId);
      setIsLocked(locked);
      setShowPrompt(locked);
  }, [tabId, isTabLocked]);

  const handlePasswordSubmit = (password: string) => {
    if (verifyPassword(tabId, password)) {
      unlockTab(tabId)
      setIsLocked(false)
      setShowPrompt(false)
    } else {
      // Potentially show an error message
      alert('Incorrect password');
    }
  }

  if (isLocked) {
    return (
      <PasswordPromptDialog
        isOpen={showPrompt}
        onClose={() => {}} // Don't allow closing
        onSubmit={handlePasswordSubmit}
        tabName={tabId.charAt(0).toUpperCase() + tabId.slice(1)}
      />
    )
  }

  return <>{children}</>
}
