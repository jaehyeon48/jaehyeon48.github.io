import React from 'react'

import { Top } from '../components/top'
import { ThemeSwitch } from '../components/theme-switch'
import { Footer } from '../components/footer'
import { rhythm } from '../utils/typography'

import './index.scss'

export const Layout = ({ title, children }) => {
  return (
    <React.Fragment>
      <Top title={title} />
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <ThemeSwitch />
        {children}
        <Footer />
      </div>
    </React.Fragment>
  )
}
