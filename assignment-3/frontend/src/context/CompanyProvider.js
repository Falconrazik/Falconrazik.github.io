import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [companyDescription, setCompanyDescription] = useState(null);
  const [stockQuote, setStockQuote] = useState(null);
  const [isApiCallSuccessful, setIsApiCallSuccessful] = useState(false);
  const [currentTicker, setCurrentTicker] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [chartData, setChartData] = useState(null); // Add this line

  const fetchCompanyDescription = async (symbol) => {
    try {
      const response = await axios.get(`/api/description/${encodeURIComponent(symbol)}`);
      if (response?.data?.ticker) {
        setCompanyDescription(response.data);
        setIsApiCallSuccessful(true);
      }
      else {
        console.log('Failed to call company api');
        setIsApiCallSuccessful(false);
        setCompanyDescription(null);
      }
    } catch (error) {
      setIsApiCallSuccessful(false);
      console.error("Error fetching company description:", error);
      setCompanyDescription(null);
    }
  };

  // Function to fetch latest stock price
  const fetchStockQuote = async (symbol) => {
    try {
      const quoteResponse = await axios.get(`/api/quote/${encodeURIComponent(symbol)}`);
      if (quoteResponse?.data?.c) {
        setStockQuote(quoteResponse.data);
        setIsApiCallSuccessful(true);
      }
      else {
        console.log('Failed to call quote api');
        setIsApiCallSuccessful(false);
        setStockQuote(null);
      }
    } catch (error) {
      setIsApiCallSuccessful(false);
      console.error("Error fetching stock quote:", error);
      setStockQuote(null); // Handle the error as you see fit
    }
  };

  const currentSymbol = useRef(); // Ref to keep track of the current symbol

  useEffect(() => {
    const lastUpdatedTime = new Date(stockQuote?.t * 1000);
    const currentTime = new Date();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    const isMarketOpen = (currentTime - lastUpdatedTime) < fiveMinutes;

    // Assuming the symbol might change, let's watch companyDescription
    let symbol = companyDescription?.ticker;
    if (symbol && isMarketOpen) {
      currentSymbol.current = symbol; // Update the ref whenever the symbol changes

      fetchCompanyDescription(symbol);
      fetchStockQuote(symbol);

      const interval = setInterval(() => {
        console.log('Refreshing summary tab');
        // Use the current value from the ref inside the interval
        fetchCompanyDescription(symbol);
        fetchStockQuote(currentSymbol.current);
      }, 15000); // 15000 milliseconds is 15 seconds

      // Clear the interval when the component unmounts or symbol changes
      return () => clearInterval(interval);
    }
  }, [companyDescription?.ticker]); // Rerun the effect if the ticker changes


  return (
    <CompanyContext.Provider value={{ companyDescription, fetchCompanyDescription, stockQuote, fetchStockQuote, isApiCallSuccessful, currentTicker, setCurrentTicker, historicalData, setHistoricalData, chartData, setChartData }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);
