'use client'

import { ReactNode, useEffect, useState } from 'react'

import { HEADER_HEIGHT_PX } from '../header/header'

import { css } from '@styles/css'

const NAVBAR_HEIGHT_PX = 50

export function NavbarContainer({ children }: { children: ReactNode }) {
  const [yPosRespectToHeaderBottom, setYPosRespectToHeaderBottom] = useState<
    'above' | 'intersecting' | 'below'
  >('above')

  useEffect(() => {
    function detectGoBelowHeaderBottom() {
      setYPosRespectToHeaderBottom(
        window.scrollY < HEADER_HEIGHT_PX
          ? 'above'
          : window.scrollY >= HEADER_HEIGHT_PX + NAVBAR_HEIGHT_PX
            ? 'below'
            : 'intersecting',
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
        backgroundColor:
          yPosRespectToHeaderBottom === 'above'
            ? 'emerald.100'
            : yPosRespectToHeaderBottom === 'below'
              ? 'white'
              : 'transparent',
      })}
    >
      {children}
    </nav>
  )
}
