import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/theme/theme-provider'
import { QueryProvider } from '@/lib/query/provider'
import { ToastContainer } from '@/components/ui'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mycraft.jp'),
  title: {
    default: 'MyCraft',
    template: '%s | MyCraft',
  },
  description: 'Minecraftワールドの住人になりきって投稿し、出来事・風景・建築を共有するSNS',
  keywords: ['Minecraft', 'マイクラ', 'SNS', 'ワールド', '建築', 'スクリーンショット'],
  authors: [{ name: 'MyCraft' }],
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'MyCraft',
    title: 'MyCraft',
    description: 'Minecraftワールドの住人になりきって投稿し、出来事・風景・建築を共有するSNS',
    images: [
      {
        url: '/defaults/default-world-icon.png',
        width: 512,
        height: 512,
        alt: 'MyCraft',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyCraft',
    description: 'Minecraftワールドの住人になりきって投稿し、出来事・風景・建築を共有するSNS',
    images: ['/defaults/default-world-icon.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <ToastContainer />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
