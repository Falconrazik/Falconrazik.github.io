import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts/highstock';
import { useCompany } from '../../context/CompanyProvider';
import './InsightTab.css';

const InsightTab = () => {
  const [insiderSentimentData, setInsiderSentimentData] = useState(null);
  const [companyRecommendationData, setCompanyRecommendationData] = useState(null);
  const [stockEarningData, setStockEarningData] = useState(null);
  const { companyDescription } = useCompany(); 
  const symbol = companyDescription?.ticker;

  useEffect(() => {
    const fetchInsiderSentimentData = async () => {
      try {
        const response = await axios.get(`/api/insider-sentiment/${symbol}`);
        setInsiderSentimentData(response.data.data);
      } catch (error) {
        console.error('Error fetching insider sentiment data:', error);
      }
  };

    const fetchCompanyRecommendationData = async () => {
      try {
        const response = await axios.get(`/api/company-recommendation/${symbol}`);
        setCompanyRecommendationData(response.data);
      } catch (error) {
        console.error('Error fetching insider sentiment data:', error);
      }
    };

    const fetchStockEarningData = async () => {
      try {
        const response = await axios.get(`/api/stock-earnings/${symbol}`);
        // Replace any null values with 0
        const sanitizedData = response.data.map(item => ({
          ...item,
          actual: item.actual !== null ? item.actual : 0,
          estimate: item.estimate !== null ? item.estimate : 0,
          surprise: item.surprise !== null ? item.surprise : 0,
          surprisePercent: item.surprisePercent !== null ? item.surprisePercent : 0
        }));
        setStockEarningData(sanitizedData);
      } catch (error) {
        console.error('Error fetching insider sentiment data:', error);
      }
    };

    if (symbol) {
      fetchInsiderSentimentData();
      fetchCompanyRecommendationData();
      fetchStockEarningData();
    }
  }, [companyDescription?.ticker]);

  const calculateInsiderSentimentStats = (data) => {
    let totalMSRP = 0;
    let positiveMSRP = 0;
    let negativeMSRP = 0;
    let totalChange = 0;
    let positiveChange = 0;
    let negativeChange = 0;

    if (Array.isArray(data)) { // Check if data is an array
      data.forEach(entry => {
        const { change, mspr } = entry;

        // Aggregate values for mspr
        totalMSRP += mspr;
        if (mspr > 0) {
          positiveMSRP += mspr;
        } else if (mspr < 0) {
          negativeMSRP += mspr;
        }

        // Aggregate values for change
        totalChange += change;
        if (change > 0) {
          positiveChange += change;
        } else if (change < 0) {
          negativeChange += change;
        }
      });
    }

    return {
      totalMSRP,
      positiveMSRP,
      negativeMSRP,
      totalChange,
      positiveChange,
      negativeChange
    };
  };

  const stats = calculateInsiderSentimentStats(insiderSentimentData);

  const stockRecommendationOptions = {
    chart: {
      type: 'column',
      backgroundColor: '#f6f6f6',
    },
    title: {
      text: 'Recommendation Trends'
    },
    xAxis: {
      categories: companyRecommendationData?.map(data => data.period),
    },
    yAxis: {
      min: 0,
      title: {
        text: '# Analysis'
      },
      stackLabels: {
        enabled: false,
      }
    },
    legend: {
      align: 'center', // Centers the legend
      verticalAlign: 'bottom', // Moves it to the bottom
      layout: 'horizontal', // Displays it horizontally
      y: -25,
      x: 10,
    },
    tooltip: {
      headerFormat: '<b>{point.x}</b><br/>',
      pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true
        }
      }
    },
    series: [{
      name: 'Strong Buy',
      data: companyRecommendationData?.map(data => data.strongBuy),
      color: 'darkgreen',
    }, {
      name: 'Buy',
      data: companyRecommendationData?.map(data => data.buy),
      color: '#25af51',
    }, {
      name: 'Hold',
      data: companyRecommendationData?.map(data => data.hold),
      color: '#b17e29',
    }, {
      name: 'Sell',
      data: companyRecommendationData?.map(data => data.sell),
      color: '#f15053',
    }, {
      name: 'Strong Sell',
      data: companyRecommendationData?.map(data => data.strongSell),
      color: '#752b2c',
    }]
  };

  const stockEarningOptions = {
    chart: {
      type: 'spline', // Use spline for a smoothed line chart
      backgroundColor: '#f6f6f6', // Light grey background
    },
    title: {
      text: 'Historical EPS Surprises'
    },
    xAxis: {
      categories: stockEarningData?.map(item => item.period), // Use the period for the xAxis categories
      labels: {
        useHTML: true, // Allows HTML in labels
        align: 'center',
        formatter: function () {
          const index = this.axis.categories.indexOf(this.value);
          const earning = stockEarningData && stockEarningData[index];
          const surpriseValue = earning && earning.surprise !== null ? earning.surprise.toFixed(4) : '0.0000';
          return `<div style="text-align: center;">${this.value}<br/><span>Surprise: ${surpriseValue}</span></div>`;
        }
      },
    },
    yAxis: {
      title: {
        text: 'Quarterly EPS'
      }
    },
    tooltip: {
      shared: true,
      valueSuffix: ' units', // You can change this to your preferred unit
      crosshairs: true
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false
        },
      }
    },
    series: [
      {
        name: 'Actual',
        data: stockEarningData?.map(item => item.actual ? item.actual : 0), // Replace null with 0
        color: '#7cb5ec', // Blue color for actual line
      },
      {
        name: 'Estimate',
        data: stockEarningData?.map(item => item.estimate ? item.estimate : 0), // Replace null with 0
        color: '#5b5cbf', // Dark color for estimate line
      }
    ],
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
          }
        }
      }]
    }
  };

  // Render the table only when insiderSentimentData is available
  return (
    <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {insiderSentimentData && companyRecommendationData && (
        <>
          <h4 style={{marginTop: '3%'}}>Insider Sentiments</h4>
          <table style={{ width: '60%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid lightgrey' }}>
                <th style={{ padding: '10px' }}>Apple Inc.</th>
                <th style={{ padding: '10px' }}>MSRP</th>
                <th style={{ padding: '10px' }}>Change</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid lightgrey' }}>
                <th style={{ padding: '10px' }}>Total</th>
                <td style={{ padding: '10px' }}>{stats.totalMSRP.toFixed(2)}</td>
                <td style={{ padding: '10px' }}>{stats.totalChange}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid lightgrey' }}>
                <th style={{ padding: '10px' }}>Positive</th>
                <td style={{ padding: '10px' }}>{stats.positiveMSRP.toFixed(2)}</td>
                <td style={{ padding: '10px' }}>{stats.positiveChange}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid lightgrey' }}>
                <th style={{ padding: '10px' }}>Negative</th>
                <td style={{ padding: '10px' }}>{stats.negativeMSRP.toFixed(2)}</td>
                <td style={{ padding: '10px' }}>{stats.negativeChange}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
      <div className="test-charts" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20}}>
       <div className="recommendation-chart" style={{padding: 10}}>
          <HighchartsReact
            highcharts={Highcharts}
            options={stockRecommendationOptions}
          />
        </div>
        <div className="eps-chart" style={{padding: 10}}>
          <HighchartsReact
            highcharts={Highcharts}
            options={stockEarningOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default InsightTab;
