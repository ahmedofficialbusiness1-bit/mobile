
'use client'

import * as React from 'react'
import { useSecurity } from '@/context/security-context'
import { PasswordPromptDialog } from './password-prompt-dialog'
import { useRouter } from 'next/navigation'

interface PageGuardProps {
  tabId: string
  children: React.ReactNode
}

export function PageGuard({ tabId, children }: PageGuardProps) {
  const { isItemLocked, unlockItem, verifyPassword } = useSecurity()
  const [isLocked, setIsLocked] = React.useState(isItemLocked(tabId));
  const [showPrompt, setShowPrompt] = React.useState(isItemLocked(tabId));
  const router = useRouter();

  React.useEffect(() => {
      const locked = isItemLocked(tabId);
      setIsLocked(locked);
      setShowPrompt(locked);
  }, [tabId, isItemLocked]);

  const handlePasswordSubmit = (password: string) => {
    if (verifyPassword(tabId, password)) {
      unlockItem(tabId)
      setIsLocked(false)
      setShowPrompt(false)
    } else {
      // Potentially show an error message
      alert('Incorrect password');
    }
  }
  
  const handleCancel = () => {
      router.push('/'); // Go to a safe page like dashboard
  }

  if (isLocked) {
    return (
      <PasswordPromptDialog
        isOpen={showPrompt}
        onClose={handleCancel} // Allow closing, which triggers cancel
        onSubmit={handlePasswordSubmit}
        tabName={tabId.charAt(0).toUpperCase() + tabId.slice(1)}
      />
    )
  }

  return <>{children}</>
}
