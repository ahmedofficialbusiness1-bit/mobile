import type { Metadata } from 'next'
import './globals.css'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/sidebar'
import { AppHeader } from '@/components/layout/header'
import { Toaster } from '@/components/ui/toaster'
import { FinancialProvider } from '@/context/financial-context'

export const metadata: Metadata = {
  title: 'DiraBiz',
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
          <SidebarProvider>
            <div className="flex">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <AppHeader />
                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
              </div>
            </div>
          </SidebarProvider>
        </FinancialProvider>
        <Toaster />
      </body>
    </html>
  )
}
