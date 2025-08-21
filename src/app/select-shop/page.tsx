
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useFinancials } from '@/context/financial-context'
import { useSecurity } from '@/context/security-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Building } from 'lucide-react'
import { PasswordPromptDialog } from '@/components/security/password-prompt-dialog'
import { useAuth } from '@/context/auth-context'
import { Logo } from '@/components/logo'

export default function SelectShopPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { shops, setActiveShopId, companyName } = useFinancials()
  const { isItemLocked, verifyPassword, unlockItem } = useSecurity()
  
  const [promptingFor, setPromptingFor] = React.useState<{id: string, name: string} | null>(null)

  const handleShopSelection = (shopId: string | null, shopName: string) => {
    const idToCheck = shopId === null ? 'headquarters' : shopId
    if (isItemLocked(idToCheck)) {
      setPromptingFor({ id: idToCheck, name: shopName })
    } else {
      setActiveShopId(shopId)
      router.push('/')
    }
  }

  const handlePasswordSubmit = (password: string) => {
    if (!promptingFor) return

    if (verifyPassword(promptingFor.id, password)) {
      unlockItem(promptingFor.id)
      const shopIdToSet = promptingFor.id === 'headquarters' ? null : promptingFor.id
      setActiveShopId(shopIdToSet)
      setPromptingFor(null)
      router.push('/')
    } else {
      alert('Incorrect password')
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
              onClick={() => handleShopSelection(null, `${companyName} (All Shops)`)}
            >
              <Building className="mr-4 h-6 w-6" />
              <div>
                <p className="font-semibold">{companyName} (All Shops)</p>
                <p className="text-sm text-muted-foreground">View consolidated data</p>
              </div>
            </Button>
            {shops.map((shop) => (
              <Button
                key={shop.id}
                variant="outline"
                className="w-full justify-start h-14 text-left"
                onClick={() => handleShopSelection(shop.id, shop.name)}
              >
                <Store className="mr-4 h-6 w-6" />
                 <div>
                    <p className="font-semibold">{shop.name}</p>
                    <p className="text-sm text-muted-foreground">{shop.location || 'Branch'}</p>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
      <PasswordPromptDialog
        isOpen={!!promptingFor}
        onClose={() => setPromptingFor(null)}
        onSubmit={handlePasswordSubmit}
        tabName={promptingFor?.name || ''}
      />
    </>
  )
}
