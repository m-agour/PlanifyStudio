import React from 'react';
import { Navbar } from 'react-bootstrap';
import './header.css';

const Header = () => {
  return (
    <header className="header">
     {/* make header link to root */}
      <a   className="header-brand" href="/" ><h1 className="header-brand">Planify</h1></a>
    </header>
  );
};


export default Header;