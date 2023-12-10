import { ReactNode } from 'react'

import { css } from '@styles/css'
import { contentSection } from '@styles/patterns'

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header
      className={css({
        backgroundColor: 'emerald.100',
        height: 280,
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
