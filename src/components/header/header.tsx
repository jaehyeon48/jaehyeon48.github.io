import { ReactNode } from 'react'

import { css } from '@styles/css'
import { contentSection } from '@styles/patterns'

export const HEADER_HEIGHT_PX = 210

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className={css({ marginBottom: 70 })}>
      <div
        className={css({
          backgroundColor: 'emerald.100',
          height: HEADER_HEIGHT_PX,
        })}
      >
        <div
          className={contentSection({
            display: 'flex',
            alignItems: 'flex-end',
            position: 'relative',
            height: '100%',
          })}
        >
          <div className={css({ width: '100%', paddingBottom: '60px' })}>
            {children}
          </div>
        </div>
      </div>
    </header>
  )
}
