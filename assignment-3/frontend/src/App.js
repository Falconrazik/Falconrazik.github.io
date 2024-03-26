import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CompanyProvider, useCompany } from './context/CompanyProvider';
import CompanyDetails from './components/CompanyDetails';
import CompanyTabs from './components/CompanyTabs';
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/SearchBar.css';
import './App.css';
import NavBar from './components/NavBar';
import Watchlist from './components/Watchlist';
import PortfolioPage from './components/Portfolio';
import { Navigate } from 'react-router-dom';

const AppContent = () => {
  const { isApiCallSuccessful } = useCompany(); // Use the state from context
  const [showDetails, setShowDetails] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [currentTicker, setCurrentTicker] = useState(null)

  const updateTicker = (newTicker) => {
    setCurrentTicker(newTicker);
  };

  const handleSearch = (query) => {
    setCurrentTicker(query);
    setShowDetails(true); // Show details and tabs when a search is made
  };

  const clearSearch = () => {
    setShowDetails(false); // Hide details and tabs when the search is cleared
  };

  // Show or hide the error message
  useEffect(() => {
    if (showDetails && !isApiCallSuccessful) {
      setShowErrorMessage(true);
      const timer = setTimeout(() => {
        setShowErrorMessage(false); // Hide the message after 3 seconds
      }, 3000);

      // Cleanup the timer on unmount
      return () => clearTimeout(timer);
    }
  }, [isApiCallSuccessful, showDetails]);

  return (
      <div class="d-flex flex-column align-items-center" style={{width: '100%', minHeight: '100vh', paddingTop: 50, paddingBottom: 50}}>
          <Routes>
            <Route path="/" element={<Navigate replace to="/search/home" />} />
            <Route path="/search/home" element={
              <>
                <SearchBar onSearch={handleSearch} onClear={clearSearch}/>
                {showDetails && isApiCallSuccessful && <CompanyDetails />}
                {showDetails && isApiCallSuccessful && <CompanyTabs />}
                {showDetails && !isApiCallSuccessful && showErrorMessage && (
                  <div className="error-test">
                    <div className="message">No data found please enter a valid Ticker</div>
                  </div>
                )}
              </>
            } />
            <Route path="/search/:symbol" element={
              <>
                <SearchBar onSearch={handleSearch} onClear={clearSearch}/>
                {showDetails && isApiCallSuccessful && <CompanyDetails />}
                {showDetails && isApiCallSuccessful && <CompanyTabs />}
                {showDetails && !isApiCallSuccessful && showErrorMessage && (
                  <div className="error-test">
                    <div className="message">No data found please enter a valid Ticker</div>
                  </div>
                )}
              </>
            } />
            <Route path="/watchlist" element={<Watchlist onSearch={handleSearch}/>} />
            <Route path="/portfolio" element={<PortfolioPage/>}/>
          </Routes>
          <div id="footer" className="text-center mt-4">
            <strong>Powered by </strong> <a href="https://finnhub.io">Finnhub.io</a>
          </div>
        </div>
  );
};

const App = () => {
  return (
    <Router>
      <CompanyProvider>
        <NavBar />
        <AppContent />
      </CompanyProvider>
    </Router>
  );
};

export default App;
