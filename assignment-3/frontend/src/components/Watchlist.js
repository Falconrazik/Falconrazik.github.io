import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // You need to install react-router-dom if you haven't already
import { ClipLoader } from 'react-spinners';
import UpArrow from '../img/arrow-up.png';
import DownArrow from '../img/arrow-down.png';
import './Watchlist.css';
import { useCompany } from '../context/CompanyProvider';

const Watchlist = ({ onSearch }) => {
  const { fetchCompanyDescription, fetchStockQuote } = useCompany();
  const [watchlist, setWatchlist] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // Hook for navigation

  // Fetch watchlist from MongoDB
  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axios.get('/api/stocks-watchlist');
        const symbols = response.data; // Assume this is an array of symbols
        setWatchlist(symbols);
        for (const symbol of symbols) {
          fetchQuoteAndUpdateQuotes(symbol);
        }
      } catch (error) {
        console.error('Error fetching watchlist', error);
      }
      setLoading(false); // Finish loading
    };

    fetchWatchlist();
  }, []);

  // Fetch latest stock quote
  const fetchQuoteAndUpdateQuotes = async (symbol) => {
    try {
      const response = await axios.get(`/api/quote/${symbol}`);
      const quoteData = response.data;

      // Fetch the company description
      const descriptionResponse = await axios.get(`/api/description/${symbol}`);
      const descriptionData = descriptionResponse.data;

      // Update the quotes state with the new data
      setQuotes(prevQuotes => ({
        ...prevQuotes,
        [symbol]: {
          ...quoteData,
          name: descriptionData.name // Merge the company name into the quote data
        }
      }));
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}`, error);
    }
  };

  // Remove stock from watchlist
  const removeFromWatchlist = async (symbol, event) => {
    event.stopPropagation(); // Prevent clicking 'x' from navigating to stock details
    try {
      await axios.delete(`/api/watchlist/${symbol}`);
      // Remove the symbol from watchlist state
      setWatchlist(currentWatchlist => currentWatchlist.filter(item => item !== symbol));
      // Remove the symbol's quote from quotes state
      setQuotes(currentQuotes => {
        const newQuotes = { ...currentQuotes };
        delete newQuotes[symbol];
        return newQuotes;
      });
    } catch (error) {
      console.error(`Error removing ${symbol} from watchlist`, error);
    }
  };

  // Navigate to stock details page
  const openStockDetails = (symbol) => {
    navigate(`/search/${symbol}`);
    fetchCompanyDescription(symbol);
    fetchStockQuote(symbol);
    onSearch(symbol);
  };

  // Loading Spinner
  if (loading) {
    return (
      <div className="spinner-container">
        <ClipLoader color="#007bff" size={60} /> {/* Customize color and size as needed */}
      </div>
    );
  }

  return (
    <div className="my-watchlist">
      <h2>My Watchlist</h2>
      {watchlist.length ? (
        watchlist.map((symbol, index) => {
          const quote = quotes[symbol];
          const color = quote ? (quote.dp === 0 ? 'black' : quote.dp > 0 ? 'green' : 'red') : 'black';
          
          return (
            <div
              key={index}
              className="watchlist-card"
              onClick={() => openStockDetails(symbol)}
            >
              <button onClick={(e) => {
                e.stopPropagation();
                removeFromWatchlist(symbol, e);
              }}>x</button>
              <div className="main-container">
                <div className="stock-container">
                  <div className="stock-symbol"><h3>{symbol}</h3></div>
                  <div className="company-name">{quote?.name}</div>
                </div>
                <div className="stock-container">
                  <h3 style={{ color: color }}>{quote && `${quote.c.toFixed(2)}`}</h3>
                  <div style={{ color: color, display: 'flex'}}>
                    {quote?.dp > 0 && <img src={UpArrow} alt="Up" className='arrow-logo'/>}
                    {quote?.dp < 0 && <img src={DownArrow} alt="Down" className='arrow-logo'/>}
                    <div>{quote && `${quote.d.toFixed(2)}`}</div>
                    <div style={{marginLeft: 5}}>{quote && `(${quote.dp.toFixed(2)}%)`}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="error-message">
          Currently you don't have any stock in your watchlist.
        </div>
      )}
    </div>
  );
};

export default Watchlist;
