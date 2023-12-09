import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Jaehyeon48's Blog",
  description: 'A personal blog by Jaehyeon Kim',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
