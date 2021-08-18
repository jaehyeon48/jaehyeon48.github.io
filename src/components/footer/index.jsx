import React from 'react';
import { GitHubIcon } from '../social-share/github-icon';

import './index.scss'

export const Footer = () => (
  <footer className="footer">
    ©Jaehyeon Kim, Built with{' '}
    <a href="https://github.com/JaeYeopHan/gatsby-starter-bee">
      Gatsby-starter-bee
    </a>
    {' '}by{' '}
    <a href="https://github.com/JaeYeopHan">Jbee</a>
    <div className="footer-socials">
      <GitHubIcon />
    </div>
  </footer>
)
