
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useFinancials } from '@/context/financial-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Building, Lock } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { Logo } from '@/components/logo'
import { useSecurity } from '@/context/security-context'
import { PasswordPromptDialog } from '@/components/security/password-prompt-dialog'

export default function SelectShopPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { shops, setActiveShopId, companyName } = useFinancials()
  const { isItemLocked, unlockItem } = useSecurity()
  const [promptingFor, setPromptingFor] = React.useState<string | null>(null)
  
  const handleShopSelection = (shopId: string | null) => {
    const itemId = shopId || 'hq';
    if (isItemLocked(itemId)) {
      setPromptingFor(itemId);
    } else {
      setActiveShopId(shopId);
      router.push('/');
    }
  }

  const handlePasswordSuccess = () => {
    if (promptingFor) {
        unlockItem(promptingFor);
        const shopId = promptingFor === 'hq' ? null : promptingFor;
        setActiveShopId(shopId);
        router.push('/');
        setPromptingFor(null);
    }
  }

  if (loading || !user) {
    return (
       <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
               <Logo />
            </div>
            <CardTitle>Select a Shop/Branch</CardTitle>
            <CardDescription>Choose which location you want to manage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-left"
              onClick={() => handleShopSelection(null)}
            >
              <Building className="mr-4 h-6 w-6" />
              <div className="flex-1">
                <p className="font-semibold">{companyName} (All Shops)</p>
                <p className="text-sm text-muted-foreground">View consolidated data</p>
              </div>
               {isItemLocked('hq', true) && <Lock className="h-4 w-4 text-muted-foreground" />}
            </Button>
            {shops.map((shop) => (
              <Button
                key={shop.id}
                variant="outline"
                className="w-full justify-start h-14 text-left"
                onClick={() => handleShopSelection(shop.id)}
              >
                <Store className="mr-4 h-6 w-6" />
                 <div className="flex-1">
                    <p className="font-semibold">{shop.name}</p>
                    <p className="text-sm text-muted-foreground">{shop.location || 'Branch'}</p>
                </div>
                 {isItemLocked(shop.id, true) && <Lock className="h-4 w-4 text-muted-foreground" />}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
       <PasswordPromptDialog
        isOpen={!!promptingFor}
        onClose={() => setPromptingFor(null)}
        onSuccess={handlePasswordSuccess}
        itemIdToUnlock={promptingFor}
      />
    </>
  )
}
