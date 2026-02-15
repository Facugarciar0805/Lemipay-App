import type { Metadata, Viewport } from 'next'
import { Inter, Space_Mono } from 'next/font/google'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
})

export const metadata: Metadata = {
  title: 'Lemipay - Group Treasury',
  description:
    'Manage group funds transparently. Funding rounds, shared wallets, and multi-signature approvals.',
}

export const viewport: Viewport = {
  themeColor: '#0f1116',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${_inter.variable} ${_spaceMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
