import { ReactNode } from 'react'

import { css } from '@styles/css'
import { contentSection } from '@styles/patterns'

export const HEADER_HEIGHT_PX = 220

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header
      className={css({
        backgroundColor: 'emerald.100',
        height: HEADER_HEIGHT_PX,
      })}
    >
      <div
        className={contentSection({
          position: 'relative',
          height: '100%',
        })}
      >
        {children}
      </div>
    </header>
  )
}
