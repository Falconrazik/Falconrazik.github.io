import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCompany } from '../context/CompanyProvider'; // Path to your context
import { Button } from 'react-bootstrap';
import "./CompanyDetails.css";
import UpArrow from '../img/arrow-up.png';
import DownArrow from '../img/arrow-down.png';
import BuyModal from './modals/BuyModal';
import YellowStar from '../img/star-yellow.png';
import EmptyStar from '../img/star-empty.png';

const CompanyDetails = () => {
  const { companyDescription, stockQuote } = useCompany(); 
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [modalState, setModalState] = useState('');
  const [maxSellQuantity, setMaxSellQuantity] = useState(0);
  const [actionMessage, setActionMessage] = useState('');
  const [showActionMessage, setShowActionMessage] = useState(false);
  const [showWatchlistMessage, setShowWatchlistMessage] = useState(false);
  const [watchlistMessage, setWatchlistMessage] = useState('');
  const [isAddWatchlist, setIsAddWatchlist] = useState(false);
  const [isBuyAction, setIsBuyAction] = useState(false);
  const [stockInPortfolio, setStockInPortfolio] = useState(false);
  const openBuyModal = () => {
    setShowBuyModal(true);
    setModalState('buy');
  };
  const openSellModal = async () => {
    try {
      setShowBuyModal(true);
      setModalState('sell');
      const response = await axios.get(`/api/portfolio/check?symbol=${companyDescription?.ticker}`);
      if (response.data?.quantity > 0) {
        setMaxSellQuantity(response.data.quantity);
        setStockInPortfolio(true);
      } else {
        // Handle case when the stock is not in the portfolio
        setStockInPortfolio(false);
      }
    } catch (error) {
      console.error('Failed to check portfolio status', error);
    }
  };
  const closeBuyModal = () => setShowBuyModal(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  // Function to be called by BuyModal when action is completed
  const onActionComplete = () => {
    setActionCompleted(prevState => !prevState); // Toggle the state to trigger a re-fetch
  };


  useEffect(() => {
    if (companyDescription && companyDescription?.ticker) {
      checkWatchlist(companyDescription.ticker);
    }
  }, [companyDescription]);

  useEffect(() => {
    checkStockSellOption();
  }, [actionCompleted, companyDescription?.ticker]);

  const checkStockSellOption = async () => {
    try {
      const response = await axios.post('/api/portfolio/check', {
        symbol: companyDescription?.ticker
      });
      if (response.data?.quantity > 0) {
        setMaxSellQuantity(response.data.quantity);
        setStockInPortfolio(true);
      } else {
        // Handle case when the stock is not in the portfolio
        setStockInPortfolio(false);
      }
    } catch (error) {
      // console.error('Failed to check portfolio status', error);
    }
  }

  const checkWatchlist = async (ticker) => {
    try {
      const response = await axios.get(`/api/stock-status/${ticker}`);
      if (response.data.inWatchlist) {
        setInWatchlist(true);
      } else {
        setInWatchlist(false);
      }
    } catch (error) {
      console.error('Failed to check watchlist status', error);
    }
  };

  const toggleWatchlist = async () => {
    if (inWatchlist) {
      try {
        await axios.delete(`/api/watchlist/${companyDescription.ticker}`);
        setInWatchlist(false);
        // Set the message for removing from watchlist
        setWatchlistMessage(`${companyDescription.ticker} removed from Watchlist.`);
        setShowWatchlistMessage(true);
        setIsAddWatchlist(false);
        setTimeout(() => setShowWatchlistMessage(false), 3000); // Hide after 3 seconds
      } catch (error) {
        console.error('Failed to remove from watchlist', error);
      }
    } else {
      try {
        await axios.post('/api/watchlist', { symbol: companyDescription.ticker });
        // Set the message for adding to watchlist
        setWatchlistMessage(`${companyDescription.ticker} added to Watchlist.`);
        setShowWatchlistMessage(true); // Show the message
        setInWatchlist(true);
        setIsAddWatchlist(true);
        setTimeout(() => setShowWatchlistMessage(false), 3000); // Hide after 3 seconds
      } catch (error) {
        console.error('Failed to add to watchlist', error);
      }
    }
  };

  if (!companyDescription || !stockQuote) {
    return null; // Or some loading indicator
  }

  // Destructure the details for display
  const {
    logo,
    name,
    exchange,
    marketCapitalization,
    ticker,
    weburl,
    ...restOfDetails
  } = companyDescription;

  const {
    c,
    d,
    dp,
    h,
    l,
    o,
    pc,
    t
  } = stockQuote

  const priceChangeClass = dp < 0 ? 'price-decrease' : 'price-increase';
  const arrowSource = dp < 0 ? DownArrow : UpArrow;

  const lastUpdateTime = new Date(t * 1000);
  const currentTime = new Date();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  const isMarketOpen = (currentTime - lastUpdateTime) < fiveMinutes;

  const formatDate = (lastTimeMillisecond) => {
    const date = new Date(lastTimeMillisecond);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Callback to be called by BuyModal on completion of buy/sell action
  const handleActionComplete = (message, isBuy) => {
    setActionMessage(message);
    setShowActionMessage(true);
    setIsBuyAction(isBuy);
    // Optionally set a timeout to hide the message after a few seconds
    setTimeout(() => setShowActionMessage(false), 5000);
  };

  return (
    <>
      <div id="main-container">
        {showActionMessage && (
          <div className={`action-message ${isBuyAction ? 'success' : 'error'}`}>
            <div className="popup-message" style={{flex: 2, textAlign: 'right', paddingRight: 100}}>{actionMessage}</div>
            <button className="close-button" onClick={() => setShowActionMessage(false)}>x</button>
          </div>
        )}
        {showWatchlistMessage && (
          <div className={`action-message ${isAddWatchlist ? 'success' : 'error'}`}>
            <div className="popup-message" style={{flex: 2, textAlign: 'right', paddingRight: 100}}>{watchlistMessage}</div>
            <button className="close-button" onClick={() => setShowWatchlistMessage(false)}>x</button>
          </div>
        )}
        <div className="company-details">
            <div className="company-header">
                <h1>
                  {ticker} 
                  <Button variant="link" onClick={toggleWatchlist}>
                    {inWatchlist ? <img src={YellowStar}></img> : <img src={EmptyStar}></img>}
                  </Button>
                </h1>
                <h2>{name}</h2>
                <p>{exchange}</p>
                <div className="button-container">
                  <Button style={{marginRight: 20}} variant="success" onClick={openBuyModal}>Buy</Button>
                  {stockInPortfolio && <Button style={{marginRight: 20}} variant="danger" onClick={openSellModal}>Sell</Button>}
                </div>
            </div>
            <div className="logo-container">
                <img src={logo} alt={`${name} logo`} className="company-logo"/>
            </div>
            <div className="stock-price">
                <h1 className={priceChangeClass}>{c?.toFixed(2)}</h1>
                <div className="price-container">
                  <div style={{display: 'flex'}}>
                    <img src={arrowSource} alt={`${name} logo`} className="arrow-logo"/>
                    <h2 className={priceChangeClass}>{d?.toFixed(2)}</h2>
                  </div>
                  <h2 className={priceChangeClass} style={{marginLeft: 8}}>({dp?.toFixed(2)}%)</h2>
                </div>
              <p className="market-date">{formatDate(t)}</p>
            </div>
        </div>
        <div className="company-footer" style={{color: isMarketOpen ? 'green' : 'red'}}>
            <strong>{isMarketOpen ? 'Market is Open' : `Market Closed on ${formatDate(lastUpdateTime)}`}</strong>
        </div>
      </div>

      <BuyModal 
        show={showBuyModal} 
        onClose={closeBuyModal} 
        onComplete={handleActionComplete} 
        stockQuote={stockQuote?.c} 
        symbol={companyDescription?.ticker} 
        component={modalState} 
        maxSellQuantity={maxSellQuantity}
        updateData={onActionComplete}
      />
    </>
  );
};

export default CompanyDetails;
