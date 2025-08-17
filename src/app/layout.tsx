
import type { Metadata } from 'next'
import './globals.css'
import { AppContent } from '@/components/layout/app-content'
import { Toaster } from '@/components/ui/toaster'
import { FinancialProvider } from '@/context/financial-context'
import { AuthProvider } from '@/context/auth-context'
import { SecurityProvider } from '@/context/security-context'

export const metadata: Metadata = {
  title: 'MaliMax',
  description: 'Mfumo wa usimamizi wa biashara unaolenga Afrika Mashariki.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FinancialProvider>
            <AuthProvider>
                <SecurityProvider>
                    <AppContent>
                    {children}
                    </AppContent>
                </SecurityProvider>
            </AuthProvider>
        </FinancialProvider>
        <Toaster />
      </body>
    </html>
  )
}
