import React from 'react';
import { Top } from '../components/top';
import { Footer } from '../components/footer';

import './index.scss';

export const Layout = ({ title, children }) => {
  return (
    <React.Fragment>
      <Top title={title} />
      <main className="main">
        {children}
      </main>
      <Footer />
    </React.Fragment>
  );
}
