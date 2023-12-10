'use client'

import { ReactNode, useEffect, useState } from 'react'

import { HEADER_HEIGHT_PX } from '../header'

import { css } from '@styles/css'

const NAVBAR_HEIGHT_PX = 50

export function NavbarContainer({ children }: { children: ReactNode }) {
  const [isBelowHeaderBottom, setIsBelowHeaderBottom] = useState(false)

  useEffect(() => {
    function detectGoBelowHeaderBottom() {
      setIsBelowHeaderBottom(
        window.scrollY >= HEADER_HEIGHT_PX + NAVBAR_HEIGHT_PX,
      )
    }

    window.addEventListener('scroll', detectGoBelowHeaderBottom)

    return () => {
      window.removeEventListener('scroll', detectGoBelowHeaderBottom)
    }
  }, [])

  return (
    <nav
      className={css({
        position: 'sticky',
        top: 0,
        width: '100vw',
        height: NAVBAR_HEIGHT_PX,
        zIndex: 999,
        backdropFilter: isBelowHeaderBottom ? 'blur(1.5px)' : 'none',
      })}
    >
      {children}
    </nav>
  )
}
