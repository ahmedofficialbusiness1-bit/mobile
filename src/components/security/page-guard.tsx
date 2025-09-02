
'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation';
import { useFinancials } from '@/context/financial-context';
import { useSecurity } from '@/context/security-context';
import { PasswordPromptDialog } from './password-prompt-dialog';

interface PageGuardProps {
  children: React.ReactNode
}

export function PageGuard({ children }: PageGuardProps) {
  const { activeShopId } = useFinancials();
  const { isItemLocked, unlockItem } = useSecurity();
  const pathname = usePathname();
  const [isPrompting, setIsPrompting] = React.useState(false);
  const [itemToUnlock, setItemToUnlock] = React.useState<string | null>(null);
  
  const currentShopItemId = activeShopId || 'hq';
  const currentPageItemId = pathname;

  React.useEffect(() => {
    let itemToPrompt: string | null = null;

    if (isItemLocked(currentPageItemId)) {
        itemToPrompt = currentPageItemId;
    } else if (isItemLocked(currentShopItemId)) {
        itemToPrompt = currentShopItemId;
    }

    if (itemToPrompt) {
        setItemToUnlock(itemToPrompt);
        setIsPrompting(true);
    } else {
        setIsPrompting(false);
        setItemToUnlock(null);
    }
  }, [activeShopId, pathname, isItemLocked, currentPageItemId, currentShopItemId]);

  const handleSuccess = () => {
      if (itemToUnlock) {
        unlockItem(itemToUnlock);
      }
      setIsPrompting(false);
      setItemToUnlock(null);
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
