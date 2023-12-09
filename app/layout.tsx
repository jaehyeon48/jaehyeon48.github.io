import '@/globals.css'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

export const metadata: Metadata = {
  title: "Jaehyeon48's Blog",
  description: 'A personal blog by Jaehyeon Kim',
}

const pretendardFont = localFont({
  src: '../public/fonts/pretenard-variable.woff2',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={pretendardFont.className}>{children}</body>
    </html>
  )
}
