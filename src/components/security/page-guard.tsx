
'use client'

import * as React from 'react'
import { useFinancials } from '@/context/financial-context';
import { useSecurity } from '@/context/security-context';
import { PasswordPromptDialog } from './password-prompt-dialog';

interface PageGuardProps {
  children: React.ReactNode
}

export function PageGuard({ children }: PageGuardProps) {
  const { activeShopId } = useFinancials();
  const { isItemLocked, unlockItem } = useSecurity();
  const [isPrompting, setIsPrompting] = React.useState(false);

  const currentItemId = activeShopId || 'hq';

  React.useEffect(() => {
    if (isItemLocked(currentItemId)) {
        setIsPrompting(true);
    } else {
        setIsPrompting(false);
    }
  }, [activeShopId, isItemLocked, currentItemId]);

  const handleSuccess = () => {
      unlockItem(currentItemId);
      setIsPrompting(false);
  }

  if (isPrompting) {
      return (
          <PasswordPromptDialog
            isOpen={true}
            onClose={() => {}} // Prevent closing
            onSuccess={handleSuccess}
            isGlobalGuard={true}
          />
      )
  }

  return <>{children}</>
}
