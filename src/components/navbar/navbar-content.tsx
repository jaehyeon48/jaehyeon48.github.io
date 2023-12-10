import { MainLogo } from '@/icons/main-logo'

import { contentSection } from '@styles/patterns'

export function NavbarContent() {
  return (
    <ul
      className={contentSection({
        display: 'flex',
        alignItems: 'center',
        height: '100%',
      })}
    >
      <li>
        <a href="/">
          <MainLogo />
        </a>
      </li>
    </ul>
  )
}
