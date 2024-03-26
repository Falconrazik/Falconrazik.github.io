// src/components/BuyModal.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './BuyModal.css'; // Your CSS file for styling the modal

const BuyModal = ({ show, onClose, onComplete, stockQuote, symbol, component, maxSellQuantity, updateData }) => {
const [quantity, setQuantity] = useState(0);
const [balance, setBalance] = useState(null);
const [total, setTotal] = useState(0);
const [error, setError] = useState(false);
const [quantityError, setQuantityError] = useState(false);

// Create a ref for tracking whether the balance has been fetched
const balanceFetchedRef = useRef(false);

// Create a ref for storing the balance
const balanceRef = useRef(null);

// Fetch balance when the modal is opened
useEffect(() => {
  const fetchBalance = async () => {
    try {
      const response = await axios.get('/api/portfolio/balance');
      console.log(response.data);
      balanceRef.current = response.data.balance; // Update the balance ref
      // Set balanceFetched to true after fetching balance
      balanceFetchedRef.current = true;
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      // Handle error, e.g., setting balance to zero or displaying a message
      balanceRef.current = 0; // Update the balance ref
    }
  };

  // Check if the modal is shown and balance hasn't been fetched yet
  if (show && !balanceFetchedRef.current) {
    fetchBalance();
  }
}, [show]); // Depend on 'show' to trigger the effect when modal is opened


  // Calculate the total whenever the quantity or stock price changes
  useEffect(() => {
    if (stockQuote && quantity) {
      const calculatedTotal = quantity * stockQuote;
      setTotal(calculatedTotal?.toFixed(2));
      setError(calculatedTotal >= balance);
      setQuantityError(quantity > maxSellQuantity);
    }
  }, [quantity, stockQuote], balance);

   // Update the quantity and ensure it's at least 1
   const handleQuantityChange = (e) => {
    setQuantity(parseFloat(e.target.value));
  };

  // Function to handle the action (buy or sell)
  const handleClick = async () => {
    try {
      const action = component === 'buy' ? 'buy' : 'sell';

      if (component === 'buy') {
        const response = await axios.post('/api/buy', {
          symbol: symbol,
          quantity: quantity,
          totalCost: total,
        });
        if (response.data) {
          // Call the onComplete callback with a success message
          onComplete(`${symbol} bought successfully.`, true);
          updateData();
        }
        console.log(response.data);
      } else if (component === 'sell') {
        const response = await axios.post('/api/sell', {
          symbol: symbol,
          quantity: quantity,
          totalCost: total,
        });
        console.log(response.data);
        if (response.data) {
          // Call the onComplete callback with a success message
          onComplete(`${symbol} sold successfully.`, false);
          updateData();
        }
      }
      setQuantity(0);
      onClose(); // Close the modal after action successfully
    } catch (error) {
      const action = component === 'buy' ? 'buy' : 'sell';
      // Call the onComplete callback with an error message
      onComplete(`Failed to ${action} ${symbol}. Please try again.`, false);
      console.error(`Error ${component === 'buy' ? 'buying' : 'selling'} stock:`, error);
    }
  };

  const disabledButton = () => {
    if (component === 'buy') return error;
    return quantityError;
  };
  

  if (!show) return null;

  return (
    <div className="modal-background">
      <div className="modal-container">
        <div className='top-container'>
          <h2>{symbol}</h2>
          <button className="close-button" onClick={onClose}><span style={{color: 'blue'}}>x</span></button>
        </div>

        <hr></hr>

        <p>Current Price: {stockQuote?.toFixed(2)}</p>
        <p>Money in wallet: ${balance?.toFixed(2)}</p>
        <p className="middle-container">
          Quantity: <input type="number" value={quantity} onChange={handleQuantityChange} />
          {error && component == 'buy' && <div style={{ color: 'red' }}>Not enough money in wallet!</div>}
          {quantityError && component == 'sell' && <div style={{ color: 'red' }}>You cannnot sell stock that you don't have!</div>}
        </p>

        <hr></hr>

        <div className="footer-modal">
          <p>Total: {total}</p>
          <button disabled={disabledButton()} className="modal-buy" style={{ opacity: disabledButton() ? 0.5 : 1}} onClick={handleClick}>
            {component === 'buy' ? 'Buy' : 'Sell'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;
