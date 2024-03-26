import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { useCompany } from '../../context/CompanyProvider'; // Adjust the path as needed
import './SummaryTab.css'; // Make sure to create and link this CSS file

const SummaryTab = () => {
  const { stockQuote, fetchStockQuote, companyDescription, fetchCompanyDescription, currentTicker, setCurrentTicker, historicalData, setHistoricalData } = useCompany(); 
  const [peers, setPeers] = useState([]);

  useEffect(() => {
    const fetchPeersData = async () => {
      const symbol = companyDescription?.ticker;

      try {
        if (symbol) {
          const peersResponse = await axios.get(`/api/peers/${symbol}`);
          const filteredPeers = peersResponse.data.filter(peer => !peer.includes('.'));
          setPeers(filteredPeers);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    const fetchHistoricalData = async () => {
      const symbol = companyDescription?.ticker;

      try {
        // Fetch historical data
        if (symbol) {
          const historicalResponse = await axios.get(`/api/historical/${symbol}`);
          if (historicalResponse.data.results) {
            const stockPriceData = historicalResponse.data.results.map(dataPoint => [dataPoint.t, dataPoint.c]);
            const volumeData = historicalResponse.data.results.map(dataPoint => [dataPoint.t, dataPoint.v]);
          
            // Update your state to include these new arrays
            setHistoricalData({
              stockPriceData,
              volumeData
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    // Only fetch historical data if currentTicker is set
    if (!currentTicker) {
      fetchHistoricalData();
      setCurrentTicker(companyDescription?.ticker)
    }
    else if (currentTicker !== companyDescription?.ticker) {
      fetchHistoricalData(companyDescription?.ticker);
      setCurrentTicker(companyDescription?.ticker);
    }

    fetchPeersData();
  }, [companyDescription?.ticker]);
  

  if (!stockQuote || !companyDescription) {
    return null;
  }

  const { h, l, o, pc, t } = stockQuote;
  const lastUpdateTime = new Date(t * 1000);
  const currentTime = new Date();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  const isMarketOpen = (currentTime - lastUpdateTime) < fiveMinutes;
  const { ipo, finnhubIndustry, weburl, ticker } = companyDescription;
  const options = {
    chart: {
      type: 'line',
      backgroundColor: '#f0f0f0', // Light grey background
      height: 500,
      width: 600,
    },
    title: {
      text: `${companyDescription?.name} Stock Price Variation`,
    },
    xAxis: {
      type: 'datetime',
      labels: {
        format: '{value:%H:%M}', // Hour and minute format
       },
    },
    series: [
      {
        name: `${companyDescription?.name}`,
        data: historicalData?.stockPriceData, // Make sure this data is structured as [[time, price], ...]
        color: isMarketOpen ? 'green' : 'red', // Dynamic coloring based on market status
      },
    ],
    credits: {
      enabled: true,
    },
    legend: {
      enabled: false,
    },
    rangeSelector: {
      enabled: false,
    },
    navigator: {
      enabled: false,
    },
  };

  const onPeerClick = (symbol) => {
    fetchCompanyDescription(symbol);
    fetchStockQuote(symbol);
  }

  return (
    <div className="main-container">
      <div className="summary-tab">
          <div className="left-container">
              <div className="price-details">
                  <p><strong>High Price:</strong> {h.toFixed(2)}</p>
                  <p><strong>Low Price:</strong> {l.toFixed(2)}</p>
                  <p><strong>Open Price:</strong> {o.toFixed(2)}</p>
                  <p><strong>Prev. Close:</strong> {pc.toFixed(2)}</p>
              </div>
              <div className="company-info">
                  <h3 style={{textDecoration: 'underline'}}>About the company</h3>
                  <p style={{marginTop: 30}}><strong>IPO Start Date:</strong> {ipo}</p>
                  <p><strong>Industry:</strong> {finnhubIndustry}</p>
                  <p><strong>Webpage:</strong> <a href={weburl}>{weburl}</a></p>
                  <p><strong>Company peers: </strong></p>
                  <p className="peers-container">
                  {peers.map((peer, index) => (
                          <a key={index} href={`#`} onClick={() => onPeerClick(peer)}>
                              {peer}{index < peers.length - 1 ? ', ' : ''}
                          </a>
                      ))} 
                  </p>
              </div>
          </div>

          <div className="right-container">
            <div className="chart-container">
              {historicalData && 
                <HighchartsReact
                  highcharts={Highcharts}
                  constructorType={'stockChart'}
                  options={options}
                />
              }
            </div>
          </div>
      </div>
    </div>
  );
};

export default SummaryTab;
