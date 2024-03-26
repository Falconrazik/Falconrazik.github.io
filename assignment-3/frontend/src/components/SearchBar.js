import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Form, InputGroup, FormControl, Button, Spinner } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './SearchBar.css';
import { useCompany } from '../context/CompanyProvider';
import { useNavigate } from 'react-router-dom';

function debounce(func, wait) {
  let timeout;

  const executedFunction = (...args) => {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  const cancel = () => clearTimeout(timeout);

  return [executedFunction, cancel];
}

const SearchBar = ({ onSearch, onClear }) => {
  const navigate = useNavigate();
  const [ticker, setTicker] = useState('');
  const { companyDescription, fetchCompanyDescription, fetchStockQuote } = useCompany();
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // State to manage loading
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showEmptyError, setShowEmptyError] = useState(false); // New state for empty input error

  // When companyDescription updates, update the localTicker state
  useEffect(() => {
    if (companyDescription?.ticker) {
      setTicker(companyDescription.ticker);
    }
  }, [companyDescription]);

  const handleClear = () => {
    setTicker(''); // Clear the ticker
    onClear();
    setSuggestions([]); // Clear suggestions after search
    setShowEmptyError(false); // Hide empty input error if shown
  };

  const [debouncedFetchSuggestions, cancelDebouncedFetchSuggestions] = useMemo(() => {
    const [debouncedFunc, cancelFunc] = debounce(async (value) => {
      if (value.length > 0) {
        setIsLoading(true); // Set loading to true
        try {
          const response = await axios.get(`/api/autocomplete?q=${value}`);
          const filteredResults = response.data.result.filter((item) => !item.symbol.includes('.'));
          setSuggestions(filteredResults);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false); // Set loading to false regardless of the outcome
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return [debouncedFunc, cancelFunc];
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setTicker(value);
    setShowAutocomplete(true);
    debouncedFetchSuggestions(value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    cancelDebouncedFetchSuggestions(); // Cancel any pending debounced fetch
    if ((ticker || '').trim() == '') {
      setShowEmptyError(true); // Show error message if input is empty
      setTimeout(() => setShowEmptyError(false), 5000); // Hide after 5 seconds
      return; // Prevent further actions if input is empty
    }
    fetchCompanyDescription(ticker);
    fetchStockQuote(ticker);
    onSearch(ticker);
    setSuggestions([]);
    setShowAutocomplete(false);
    navigate(`/search/${ticker}`); // This will change the route
  };

  const handleSuggestionClick = (symbol) => {
    cancelDebouncedFetchSuggestions(); // Cancel any pending debounced fetch
    fetchCompanyDescription(symbol);
    fetchStockQuote(symbol);
    onSearch(symbol); // Assuming onSearch is a prop for additional logic
    setTicker(symbol);
    setSuggestions([]); // Clear suggestions after search
    setShowAutocomplete(false);
    navigate(`/search/${symbol}`); // This will change the route
  };
  
  return (
    <div className="search-container">
      <h2 className="text-center mb-4">STOCK SEARCH</h2>
      <Form onSubmit={handleSubmit} className="search-bar">
        <InputGroup>
          <FormControl
            id="form-input"
            placeholder="Enter stock ticker symbol"
            aria-label="Enter stock ticker symbol"
            aria-describedby="basic-addon2"
            value={ticker}
            onChange={handleInputChange}
          />
          <Button type="submit">
            <i className="bi bi-search"></i>
          </Button>
          <Button id="clear-btn" onClick={handleClear}>
            <i className="bi bi-x-lg"></i>
          </Button>
        </InputGroup>
      </Form>

      <div className="autocomplete-container">
        {isLoading && showAutocomplete ? (
            <ul className="autocomplete-suggestions">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </ul>
          ) : (
            suggestions?.length > 0 && showAutocomplete &&
            <ul className="autocomplete-suggestions">
              {suggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handleSuggestionClick(suggestion.symbol)}>
                  {suggestion.displaySymbol} | {suggestion.description}
                </li>
              ))}
            </ul>
          )
        }
      </div>

      {showEmptyError && (
        <div className={'action-message'}>
          <div className="popup-message">Please enter a valid ticker</div>
          <button className="close-button" onClick={() => setShowEmptyError(false)}>x</button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
