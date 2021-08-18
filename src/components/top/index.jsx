import React from 'react';
import { Link } from 'gatsby';
import { ThemeSwitch } from '../theme-switch';

import './index.scss';

export const Top = ({ title }) => {
  return (
    <nav className="top">
      <Link to={`/`} className="link">
        {title}
      </Link>
      <ThemeSwitch />
    </nav>
  );
}
