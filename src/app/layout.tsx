import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-serif',
  weight: ['700'],
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Kuber — a CFO for small businesses',
  description:
    'Kuber connects to your payments, commerce, CRM, and bank — and turns every transaction into a decision.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  )
}
