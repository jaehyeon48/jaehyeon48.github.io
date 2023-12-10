import { MainLogo } from '@/icons/main-logo'

import { css } from '@styles/css'
import { contentSection } from '@styles/patterns'

export function NavbarContent() {
  return (
    <ul
      className={contentSection({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
      })}
    >
      <li>
        <a href="/">
          <MainLogo />
        </a>
      </li>
      <li>
        <a href="/posts/categories" className={css({ fontWeight: 700 })}>
          Categories
        </a>
      </li>
    </ul>
  )
}
