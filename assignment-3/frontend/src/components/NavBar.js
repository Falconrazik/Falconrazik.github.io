import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './NavBar.css';

const NavBar = () => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('/search'); // Default active tab

  return (
    <Navbar bg="primary" variant="dark" expand="lg" fixed="top" expanded={expanded}>
      <div className="container-fluid nav-container">
        <Navbar.Brand as={NavLink} to="/" onClick={() => {setActiveTab('/home'); setExpanded(false);}}>Stock Search</Navbar.Brand>
        <Navbar.Toggle 
          aria-controls="responsive-navbar-nav" 
          onClick={() => setExpanded(expanded ? false : "expanded")}
        />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link  className={`nav-link ${activeTab === '/home' ? 'nav-active' : ''}`} onClick={() => {setActiveTab('/home'); setExpanded(false)}} as={NavLink} to="/search/home">Search</Nav.Link>
            <Nav.Link  className={`nav-link ${activeTab === '/watchlist' ? 'nav-active' : ''}`} onClick={() => {setActiveTab('/watchlist'); setExpanded(false)}} as={NavLink} to="/watchlist">Watchlist</Nav.Link>
            <Nav.Link  className={`nav-link ${activeTab === '/portfolio' ? 'nav-active' : ''}`} onClick={() => {setActiveTab('/portfolio'); setExpanded(false)}} as={NavLink} to="/portfolio">Portfolio</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default NavBar;
