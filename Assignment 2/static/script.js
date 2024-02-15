document.addEventListener('DOMContentLoaded', function() {
  const errorMessage = document.getElementById('error-message')
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('submit-button');
  const resetButton = document.getElementById('reset-button');
  const newsContainer = document.getElementById('news-container');
  const chart = document.getElementById('chart');
  const searchBox = document.getElementById('searchBox');

  // Get the tab elements
  const tabsContainer = document.querySelector('.tabs')
  const tabs = document.querySelectorAll('.tabs div');
  const companyTab = document.getElementById('company-tab');
  const stockSummaryContainer = document.getElementById('stock-summary-container');

  // Initially hide the tabs and their content sections
  tabsContainer.style.display = 'none';
  companyTab.style.display = 'none';
  stockSummaryContainer.style.display = 'none';
  newsContainer.style.display = 'none';
  chart.style.display = 'none';
  errorMessage.style.display = 'none';

  resetButton.addEventListener('click', function() {
    // Clear the search input
    searchInput.value = '';

    // Hide all the tabs and sections
    tabsContainer.style.display = 'none';
    companyTab.style.display = 'none';
    stockSummaryContainer.style.display = 'none';
    newsContainer.style.display = 'none'
    chart.style.display = 'none'
    errorMessage.style.display = 'none';
  });

  function resetActiveTab() {
    // Remove active class from all tabs
    tabs.forEach(tab => tab.classList.remove('active-tab'));
    // Set the first tab (Company) as active
    tabs[0].classList.add('active-tab');
  }

  function showCompanyTab() {
    resetActiveTab(); // Reset tabs to default state
    companyTab.style.display = 'block'; // Show company profile section
    stockSummaryContainer.style.display = 'none'; // Hide other sections
    newsContainer.style.display = 'none'
    chart.style.display = 'none'
  }

  // Function to hide all sections
  function hideAllSections() {
    companyTab.style.display = 'none';
    stockSummaryContainer.style.display = 'none';
    newsContainer.style.display = 'none';
    chart.style.display = 'none';
    errorMessage.style.display = 'none';
  }

  // Function to show a section
  function showSection(section) {
    hideAllSections();
    section.style.display = 'block';
  }

  // Iterate over each tab and add click event listeners
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active-tab'));

      // Add active class to the clicked tab
      this.classList.add('active-tab');

      // Check the text of the tab and show the corresponding section
      if (this.textContent === 'Company') {
        showSection(companyTab);
      } else if (this.textContent === 'Stock Summary') {
        showSection(stockSummaryContainer);
      } else if (this.textContent === 'Latest News') {
        showSection(newsContainer);
      } else if (this.textContent === 'Charts') {
        showSection(chart);
      }
    });
  });

  async function handleSearch() {
    const stockSymbol = document.getElementById('search-input').value.toUpperCase();
    if (!stockSymbol) {
      return; // Exit if no symbol is entered
    }
  
    // Helper function to perform fetch and handle errors
    async function performFetch(url) {
      const response = await fetch(url);
      if (!response.ok) {
        tabsContainer.style.display = 'none';
        hideAllSections();
        errorMessage.style.display = 'flex';
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      const data = await response.json();
      if (data.error) {
        tabsContainer.style.display = 'none';
        hideAllSections();
        errorMessage.style.display = 'flex';
        throw new Error(data.error); // Throw an error if there is an error message in the response
      }
      if (Object.keys(data).length === 0) {
        tabsContainer.style.display = 'none';
        hideAllSections();
        errorMessage.style.display = 'flex';
        throw new Error('Error: The response from the server is empty.'); // Throw an error for empty response
      }
      errorMessage.style.display = 'none';
      return data; // Return data if no errors
    }
  
    try {
      // Search API call
      const searchData = await performFetch(`/search?symbol=${encodeURIComponent(stockSymbol)}`);
      populateCompanyProfile(searchData);
      tabsContainer.style.display = 'flex';
      showCompanyTab();
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
      return; // Exit the function after handling the error
    }
  
    // Subsequent API calls are only made if the Search API call succeeds
    try {
      // Stock Quote API call
      const quoteData = await performFetch(`/stock_quote?symbol=${encodeURIComponent(stockSymbol)}`);
      populateStockSummary(quoteData);
  
      // Stock Recommendation API call
      const recommendationData = await performFetch(`/stock_recommendation?symbol=${encodeURIComponent(stockSymbol)}`);
      populateStockRecommendation(recommendationData);
  
      // Company News API call
      const newsData = await performFetch(`/get_company_news?symbol=${encodeURIComponent(stockSymbol)}`);
      renderArticles(newsData);
  
      // Stock Chart API call
      const chartData = await performFetch(`/get_stock_chart?symbol=${encodeURIComponent(stockSymbol)}`);
      processChartData(chartData);
    } catch (error) {
      errorMessage.style.display = 'flex';
      console.error('There has been a problem with your fetch operation:', error);
      return;
    }
  }

  // Function to create an article DOM element
  function createArticleElement(article) {
    const articleElem = document.createElement('div');
    articleElem.classList.add('article');

    articleElem.innerHTML = `
        <img src="${article.image}" alt="Article Image">
        <div class="content">
            <div class="headline">${article.headline}</div>
            <div class="date">${convertTimestamp(article.datetime)}</div>
            <a href="${article.url}" target="_blank" class="link">See Original Post</a>
        </div>
    `;

    return articleElem;
  }

  // Function to render articles
  function renderArticles(articles) {
    // Clear existing articles
    newsContainer.innerHTML = '';

    let displayedCount = 0;
    for (let article of articles) {
      if (article.image && article.headline && article.datetime && article.url &&
        article.image !== "" && article.headline !== "" && article.url !== "") {
        const articleElem = createArticleElement(article);
        newsContainer.appendChild(articleElem);
        displayedCount++;
      }

      if (displayedCount === 5) {
        break; // Stop the loop when 5 articles have been displayed
      }
    }
  }


  // Event listener for the search button click
  searchButton.addEventListener('click', function(event) {
    if (!searchInput.reportValidity()) {
      // The reportValidity() call will automatically display the "Please fill out this field" message if the input is invalid
    } else {
      handleSearch();
    }
  });
  
  // Event listener for the enter/return key in the search input
  searchInput.addEventListener('keypress', function(event) {
    if (!searchInput.reportValidity()) {
      // The reportValidity() call will automatically display the "Please fill out this field" message if the input is invalid
    } else {
      // Handle the case where the input is valid (e.g., proceed with form submission or other logic)
    }
    if (event.key === 'Enter') {
      handleSearch();
      event.preventDefault();
    }
  });

  let tickerSymbol = ''
  function populateCompanyProfile(data) {
    const logoElement = document.getElementById('company-logo');
    const nameElement = document.getElementById('company-name');
    const companyTickerElement = document.getElementById('company-stock-ticker');
    const stockTickerElement = document.getElementById('stock-ticker'); 
    const exchangeElement = document.getElementById('company-stock-exchange');
    const startDateElement = document.getElementById('company-start-date');
    const categoryElement = document.getElementById('company-category');

    logoElement.src = data.logo;
    nameElement.textContent = data.name;
    companyTickerElement.textContent = data.ticker;
    stockTickerElement.textContent = data.ticker;
    tickerSymbol = data.ticker;
    exchangeElement.textContent = data.exchange;
    startDateElement.textContent = data.ipo;
    categoryElement.textContent = data.finnhubIndustry;
  }

  function populateStockSummary(data) {
    const tradingDayElement = document.getElementById('trading-day');
    const prevClosingPriceElement = document.getElementById('previous-price');
    const openningPriceElement = document.getElementById('openning-price');
    const highPriceElement = document.getElementById('high-price');
    const lowPriceElement = document.getElementById('low-price');
    const changeElement = document.getElementById('stock-change');
    const changeElementIndicator = document.getElementById('stock-change-indicator')
    const changePercentElement = document.getElementById('change-percent');
    const changePercentIndicator = document.getElementById('change-percent-indicator')

    // Populate the elements with data from the API
    tradingDayElement.textContent = convertDate(data.t)
    prevClosingPriceElement.textContent = data.pc;
    openningPriceElement.textContent = data.o;
    highPriceElement.textContent = data.h;
    lowPriceElement.textContent = data.l;
    changeElement.textContent = data.d;
    changePercentElement.textContent = data.dp;

    if (data.d > 0) {
      changeElementIndicator.src = "/static/img/GreenArrowUp.png"
    }
    else {
      changeElementIndicator.src = "/static/img/RedArrowDown.png"
    }

    if (data.dp > 0) {
      changePercentIndicator.src = "/static/img/GreenArrowUp.png"
    }
    else {
      changePercentIndicator.src = "/static/img/RedArrowDown.png"
    }
  }
});

function populateStockRecommendation(data) {
  const strongSellElement = document.getElementById('strong-sell')
  const sellElement = document.getElementById('sell')
  const holdElement = document.getElementById('hold')
  const buyElement = document.getElementById('buy')
  const strongBuyElement = document.getElementById('strong-buy')

  latestRecommendation = data[0]
  strongSellElement.textContent = latestRecommendation.strongSell
  sellElement.textContent = latestRecommendation.sell
  holdElement.textContent = latestRecommendation.hold
  buyElement.textContent = latestRecommendation.buy
  strongBuyElement.textContent = latestRecommendation.strongBuy
}

// Assuming `data` is the JSON object received from the API
// with the structure { t: [timestamps], c: [closePrices], v: [volumes] }
function processChartData(data) {
  const stockTickerElement = document.getElementById('stock-ticker');
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Adding 1 to month because it's zero-indexed
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  const stockPriceData = [];
  const volumeData = [];

  for (let i = 0; i < data.results.length; i++) {
    // Convert timestamp to milliseconds for Highcharts
    const dateInMillisec = data.results[i].t;
    stockPriceData.push([dateInMillisec, data.results[i].c]);
    volumeData.push([dateInMillisec, data.results[i].v]);
  }

  Highcharts.setOptions({
    lang: {
      rangeSelectorZoom: 'Zoom'
    }
  });

  // Initialize Highcharts
  Highcharts.stockChart('chart', {
    // Define the rangeSelector with buttons
    rangeSelector: {
      inputEnabled: false,
      allButtonsEnabled: true,
      buttons: [{
          type: 'day',
          count: 7,
          text: '7d',
      }, {
          type: 'day',
          count: 15,
          text: '15d',
      }, {
          type: 'month',
          count: 1,
          text: '1m',
      }, {
          type: 'month',
          count: 3,
          text: '3m',
      }, {
          type: 'all',
          text: '6m',
      }],
      selected: 4
    },

    title: {
      text: `Stock Price ${stockTickerElement.textContent} ${formattedDate}`
    },
    subtitle: {
        text: '<a href="https://polygon.io/" style="color: blue; text-decoration: underline;">Source: Polygon.io</a>'
    },
    xAxis: {
      type: 'datetime',
      labels: {
        format: '{value:%e %b}' // Date format like "17 Jan"
      },
      offset: 0,
      top: '-30%',
    },
    chart: {
      marginRight: 80
    },
    yAxis: [{
      title: {
          text: 'Stock Price'
      },
      labels: {
          format: '${value:.2f}'
      },
      height: '70%',
      resize: {
          enabled: true
      },
      opposite: false,
      min: null,
      max: null,
    }, {
      title: {
        y: -42,
        x: 42,
        text: 'Volume'
      },
      labels: {
        x: 40,
        formatter: function() {
          return (this.value / 1000000) + 'M';
        }
      },
      top: '20%',
      height: '50%',
      offset: 0,
      lineWidth: 1,
      opposite: true,
      min: 0
    }],
    legend: {
        enabled: false
    },
    tooltip: {
      shared: true
    },
    plotOptions: {
      area: {
        fillColor: {
            linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
            },
            stops: [
                [0, Highcharts.getOptions().colors[0]],
                [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
            ]
        },
        marker: {
            radius: 2
        },
        lineWidth: 2,
        states: {
            hover: {
                lineWidth: 1
            }
        },
        threshold: null
      },
      column: {
        maxPointWidth: 10 // This value sets the maximum pixel width of the volume bars
      }
    },
    navigator: {
      // Adjust the top margin
      margin: -150
    },
    series: [{
        type: 'area',
        name: 'Stock Price',
        data: stockPriceData,
        yAxis: 0 // Associating this series with the first y-axis
    }, {
        type: 'column',
        name: 'Volume',
        data: volumeData,
        yAxis: 1, // Associating this series with the second y-axis
        color: '#666666'
    }]
  });
}


// HELPER FUNCTION //
function convertDate(timestamp) {
  var date = new Date(timestamp * 1000);
  var options = { day: '2-digit', month: 'long', year: 'numeric' };
  var humanReadableDate = date.toLocaleDateString('en-US', options);

  return humanReadableDate
}

// Function to convert Unix epoch time to a human-readable date
function convertTimestamp(timestamp) {
  var date = new Date(timestamp * 1000);
  var options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}