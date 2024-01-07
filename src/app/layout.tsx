import { auth } from '@/auth'
import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PDV to Everyone',
  description: 'PDV para pequenos comércios',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <html lang="pt-BR">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </SessionProvider>

  )
}
