import React from 'react';
import { Top } from '../components/top';
import { Footer } from '../components/footer';

import './index.scss';

export const Layout = ({ title, children, selectCategory }) => {
  return (
    <React.Fragment>
      <Top title={title} selectCategory={selectCategory}/>
      <main className="main">
        {children}
      </main>
      <Footer />
    </React.Fragment>
  );
}
