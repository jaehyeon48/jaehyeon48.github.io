import { Fragment } from 'react'

import { CaretRightIcon } from '@/icons/caret-right'

import { flex } from '@styles/patterns'
import { css } from '@styles/css'

export const ANCHOR_STYLE = css({ color: 'sky.600' })

interface Path {
  label: string
  href: string
}

interface HeaderContentPathProps {
  paths?: Path[]
}

const HOME_PATH: Path = {
  label: 'home',
  href: '/',
}

export function HeaderContentPath({
  paths: pathsProp = [],
}: HeaderContentPathProps) {
  const paths = [HOME_PATH, ...pathsProp]

  return (
    <div
      className={flex({
        gap: 2,
        align: 'center',
        hideBelow: 'sm',
      })}
    >
      {paths.map(({ href, label }, index) => (
        <Fragment key={href}>
          <a href={href} className={css({ color: 'sky.600' })}>
            {label}
          </a>
          {index < paths.length - 1 && (
            <CaretRightIcon width={18} height={18} color="gray.400" />
          )}
        </Fragment>
      ))}
    </div>
  )
}
