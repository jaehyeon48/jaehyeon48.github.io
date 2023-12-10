import '@/globals.css'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { css } from '@styles/css'
import { Navbar } from '@components/navbar/navbar'

export const metadata: Metadata = {
  title: "Jae's Blog",
  description: 'A personal blog by Jaehyeon Kim',
}

const pretendardFont = localFont({
  src: '../public/fonts/pretenard-variable.woff2',
  display: 'swap',
  variable: '--font-pretendard',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={pretendardFont.variable}>
      <body className={css({ fontFamily: 'pretendard' })}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
