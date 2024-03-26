import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Portfolio.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BuyModal from './modals/BuyModal';

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [balance, setBalance] = useState(null);
  const [modalState, setModalState] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [actionMessage, setActionMessage] = useState('');
  const [showActionMessage, setShowActionMessage] = useState(false);
  const [isBuyAction, setIsBuyAction] = useState(false);
  const [quantity, setQuantity] = useState(null);
  const openBuyModal = (symbol) => {
    setShowBuyModal(true);
    setSelectedStock(symbol);
    setModalState('buy');
  };
  const openSellModal = (symbol, quantity) => {
    setShowBuyModal(true);
    setSelectedStock(symbol);
    setQuantity(quantity);
    setModalState('sell');
  }
  const closeBuyModal = () => setShowBuyModal(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  // Function to be called by BuyModal when action is completed
  const onActionComplete = () => {
    setActionCompleted(prevState => !prevState); // Toggle the state to trigger a re-fetch
  };

  // Fetch stocks from the portfolio
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data } = await axios.get('/api/portfolio');
        setPortfolio(data);
        // Loop through each stock in the portfolio and fetch quote and description
        for (const stock of data) {
          fetchQuoteAndUpdateQuotes(stock.symbol); // Fetch quote and description for each stock
        }
      } catch (error) {
        console.error('Error fetching portfolio data', error);
      }
    };

    fetchPortfolio();

    const fetchBalance = async () => {
      try {
        const response = await axios.get('/api/portfolio/balance');
        setBalance(response.data.balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
        // Handle error, e.g., setting balance to zero or displaying a message
        setBalance(0);
      }
    };

    fetchBalance();
  }, [actionCompleted]); // Remove stockQuote dependency from useEffect

  // Fetch latest stock quote and description
  const fetchQuoteAndUpdateQuotes = async (symbol) => {
    try {
      // Fetch the latest stock quote
      const response = await axios.get(`/api/quote/${symbol}`);
      const quoteData = response.data;

      // Fetch the company description
      const descriptionResponse = await axios.get(`/api/description/${symbol}`);
      const descriptionData = descriptionResponse.data;

      // Update the portfolio with the new data
      setPortfolio(prevPortfolio => prevPortfolio.map(stock => {
        if (stock.symbol === symbol) {
          return {
            ...stock,
            name: descriptionData.name,
            currentPrice: quoteData.c,
            marketValue: quoteData.c * stock.quantity,
            change: Math.round(((stock?.totalCost / stock.quantity) - quoteData.c) * 100) / 100,
            totalCost: stock.totalCost,
            avgCostPerShare: stock?.totalCost / stock?.quantity // Calculate average cost per share
          };
        }
        return stock;
      }));
    } catch (error) {
      console.error(`Error fetching quote and description for ${symbol}`, error);
    }
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
    <div className="portfolio-container">
      {showActionMessage && (
        <div className={`action-message ${isBuyAction ? 'success' : 'error'}`}>
          <div style={{flex: 2, textAlign: 'right', paddingRight: 20}}>{actionMessage}</div>
          <button className="close-button" onClick={() => setShowActionMessage(false)}>x</button>
        </div>
      )}
      <h1>My Portfolio</h1>
      {balance !== null && <h4>Money in Wallet: ${balance.toFixed(2)}</h4>}

      {!portfolio.length ? 
        (
          <>
            <div className="error-message">
              Currently you don't have any stock.
            </div>
          </>
        ) : 
        (
          <>
            {portfolio.map((stock, index) => (
              <div key={index} className="portfolio-item">
                <div className="name-container">
                  <h3>{stock.symbol}</h3>
                  <h5 style={{marginLeft: 10}}>{stock.name}</h5> {/* Display company name */}
                </div>

                <div className="information-container">
                  <div className="stats-container">
                    <div style={{flex: 2}}>
                      <p>Quantity: </p>
                      <p>Avg. Cost / Share: </p>
                      <p>Total Cost:</p>
                    </div>
                    <div style={{flex: 1}}>
                      <p>{stock?.quantity}</p>
                      <p>{stock?.avgCostPerShare?.toFixed(2)}</p>
                      <p style={{ color: stock?.change?.toFixed(2) > 0 ? 'green' : stock.change < 0 ? 'red' : 'black' }}>{parseFloat(stock?.totalCost).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="stats-container">
                    <div style={{flex: 2}}>
                      <p>Change: </p>
                      <p>Current Price: </p>
                      <p>Market Value:</p>
                    </div>
                    <div style={{flex: 1}}>
                      <p style={{ color: stock?.change?.toFixed(2) > 0 ? 'green' : stock.change < 0 ? 'red' : 'black' }}>{stock?.change?.toFixed(2)}</p>
                      <p style={{ color: stock?.change?.toFixed(2) > 0 ? 'green' : stock.change < 0 ? 'red' : 'black' }}>{stock?.currentPrice?.toFixed(2)}</p>
                      <p>{stock?.marketValue?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="footer-container">
                  <button className="modal-buy" onClick={() => {openBuyModal(stock.symbol); setCurrentPrice(stock?.currentPrice)}} style={{backgroundColor: 'blue',  padding: "6px 16px"}}>Buy</button>
                  <button className="modal-buy" onClick={() => {openSellModal(stock.symbol, stock.quantity); setCurrentPrice(stock?.currentPrice)}} style={{marginLeft: 20, backgroundColor: 'red', padding: "6px 16px"}}>Sell</button>
                </div>
              </div>
            ))}
            <BuyModal
              show={showBuyModal}
              onClose={closeBuyModal}
              onComplete={handleActionComplete}
              stockQuote={currentPrice}
              symbol={selectedStock}
              component={modalState}
              maxSellQuantity={quantity}
              updateData={onActionComplete}
            />
          </>
        )
      }
    </div>
  );
};

export default PortfolioPage;
