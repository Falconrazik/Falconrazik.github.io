import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts/highstock';
import axios from 'axios';
import SMA from 'highcharts/indicators/indicators';
import VBP from 'highcharts/indicators/volume-by-price';
import { useCompany } from '../../context/CompanyProvider';
import './ChartTab.css'

SMA(Highcharts); // Initialize the SMA indicator.
VBP(Highcharts);
const ChartTab = () => {
  const { companyDescription, currentTicker, chartData, setChartData } = useCompany(); 
  const symbol = companyDescription?.ticker;

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await axios.get(`/api/chart/${symbol}`);
        const data = response.data.results;

        const ohlcData = data.map(item => [
          item.t, // the date in milliseconds
          item.o, // open
          item.h, // high
          item.l, // low
          item.c  // close
        ]);


        const stockPriceData = response.data.results.map(dataPoint => [dataPoint.t, dataPoint.c]);
        const volumeData = response.data.results.map(dataPoint => [dataPoint.t, dataPoint.v]);

        setChartData({
          ohlc: ohlcData,
          volume: volumeData,
          stockPriceData,
        });

      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

     if (!currentTicker) {
       fetchHistoricalData();
     }
     else if (currentTicker !== companyDescription?.ticker) {
       fetchHistoricalData(companyDescription?.ticker);
     }
  }, [symbol]);

  useEffect(() => {
      Highcharts.stockChart('chart-container', {
        rangeSelector: {
          selected: 1
        },
        title: {
          text: `${symbol} Historical`
        },
        yAxis: [{
          labels: {
            align: 'right',
            x: -3
          },
          title: {
            text: 'OHLC'
          },
          height: '60%',
          lineWidth: 2
        }, {
          labels: {
            align: 'right',
            x: -3
          },
          title: {
            text: 'Volume'
          },
          top: '65%',
          height: '35%',
          offset: 0,
          lineWidth: 2
        }],
        series: [{
          type: 'candlestick',
          id: 'aapl-ohlc', // You need to provide an id for the series to link the SMA
          name: `${symbol} Stock Price`,
          data: chartData?.ohlc,
          dataGrouping: {
            units: [['day', [1]]]
          },
        }, {
          type: 'column',
          id: 'volume',
          name: 'Volume',
          data: chartData?.volume,
          yAxis: 1,
          dataGrouping: {
            units: [['day', [1]]]
          },
        },
        {
          type: 'sma',
          linkedTo: 'aapl-ohlc', // Link the SMA series to the candlestick series
          zIndex: 1, // Optionally set the z-index to ensure the SMA is above the candlestick series
          marker: {
            enabled: false // This hides the markers
          },
          tooltip: {
            valueDecimals: 2
          },
          color: 'red',
        },
        {
          type: 'vbp',
          linkedTo: 'aapl-ohlc',
          params: {
            volumeSeriesID: 'volume'
          },
          dataLabels: {
              enabled: false
          },
          zoneLines: {
              enabled: false
          }
        }
      ],
      });
  }, [chartData, symbol]);

  return (
    <div id="chart-container" className="chart" style={{width: 1000, height: 700, marginTop: '5%'}}></div>
  );
};

export default ChartTab;
