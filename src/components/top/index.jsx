import React from 'react';
import { Link } from 'gatsby';
import { ThemeSwitch } from '../theme-switch';

import './index.scss';

export const Top = ({ title, selectCategory }) => {
  function resetCategory() {
    selectCategory('All');
  }
  return (
    <nav className="top">
      <Link to={`/`} className="link" onClick={resetCategory}>
        {title}
      </Link>
      <ThemeSwitch />
    </nav>
  );
}
