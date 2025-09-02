
'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSecurity } from '@/context/security-context'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface PasswordPromptDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  isGlobalGuard?: boolean
}

export function PasswordPromptDialog({
  isOpen,
  onClose,
  onSuccess,
  isGlobalGuard = false,
}: PasswordPromptDialogProps) {
  const [passwordInput, setPasswordInput] = React.useState('')
  const [error, setError] = React.useState('')
  const { checkPassword } = useSecurity()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = () => {
    if (checkPassword(passwordInput)) {
      onSuccess()
      setPasswordInput('')
      setError('')
    } else {
      setError('Incorrect password. Please try again.')
    }
  }

  const handleCancel = () => {
    if (isGlobalGuard) {
        // Redirect to a safe page if the user cancels the global guard
        router.push('/select-shop');
        toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'You must enter the correct password to access this area.',
        })
    }
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Enter Password</DialogTitle>
          <DialogDescription>
            This area is protected. Please enter the password to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Input
            type="password"
            placeholder="••••••••"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          {!isGlobalGuard && (
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
          )}
          <Button type="button" onClick={handleSubmit}>
            Unlock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
