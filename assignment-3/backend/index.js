const express = require('express');
require('dotenv').config(); // To access environment variables
const path = require('path'); // Add this line to require the path module
const axios = require('axios'); // Import axios
const app = express();
const PORT = process.env.PORT || 3001;
const { client } = require('./mongoDB'); // Assuming you have exported your MongoDB client object from 'mongodbConnection.js'

app.use(express.json());

app.use(express.static(path.join(__dirname, './build')));

// Define the API endpoint
app.get('/api/description/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const apiKey = process.env.FINNHUB_API_KEY; // Make sure to set this in your .env file

  try {
    if (!symbol) {
      return res.status(400).send('Stock symbol is required');
    }

    // Construct the request URL for the Finnhub API
    const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;

    // Fetch data from Finnhub API using axios
    const response = await axios.get(url);
    // Axios automatically handles the response as JSON, so no need to call .json()
    res.json(response.data); // Send the JSON data back to the client
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/quote/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const apiKey = process.env.FINNHUB_API_KEY;

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/peers/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const apiKey = process.env.FINNHUB_API_KEY;

  try {
    const response = await axios.get(`https://finnhub.io/api/v1/stock/peers?symbol=${symbol}&token=${apiKey}`);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching company peers:", error);
    res.status(500).send('Internal Server Error');
  }
});

// API endpoint for fetching historical data
app.get('/api/historical/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const finnhubApiKey = process.env.FINNHUB_API_KEY;
  const polygonApiKey = process.env.POLYGON_API_KEY;

  try {
    // First, fetch the last updated time from the quote
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${finnhubApiKey}`;
    const quoteResponse = await axios.get(quoteUrl);
    const lastUpdatedTime = new Date(quoteResponse.data.t * 1000); // Assuming 't' represents the timestamp of the last update

    // Calculate the 'from' and 'to' dates based on market status
    const currentTime = new Date();
    let fromDate = new Date();
    let toDate = new Date();

    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    const isMarketOpen = (currentTime - lastUpdatedTime) < fiveMinutes;

    if (!isMarketOpen) {
      // If market is closed, fetch from the day before the last updated time to the last updated time
      fromDate.setDate(lastUpdatedTime.getDate() - 5);
      fromDate.setMonth(lastUpdatedTime.getMonth());
    } else {
      // If market is open, set toDate to current time
      fromDate.setDate(lastUpdatedTime.getDate() - 1);
      fromDate.setMonth(lastUpdatedTime.getMonth());
      toDate = currentTime;
    }
    // Format dates to YYYY-MM-DD
    const to = toDate.toISOString().split('T')[0];
    const from = fromDate.toISOString().split('T')[0];

     // Construct the Polygon.io API URL
    const polygonURL = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/hour/${from}/${to}?adjusted=true&sort=asc&apiKey=${polygonApiKey}`;
   
    // Fetch the historical data from Polygon.io
    const polygonResponse = await axios.get(polygonURL);

    // Send the transformed data to the client
    res.json(polygonResponse.data);
  } catch (error) {
    console.error("Error fetching historical data:", error);
    res.status(500).send('Internal Server Error');
  }
});

// API endpoint for fetching historical data
app.get('/api/chart/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const polygonApiKey = process.env.POLYGON_API_KEY;

  try {
    // Calculate the 'from' and 'to' dates based on market status
    const currentTime = new Date();
    const toDate = currentTime;
    const fromDate = new Date();
    // fromDate.setMonth(toDate.getMonth() - 24); // Subtract 2 years from current date
    fromDate.setFullYear(toDate.getFullYear() - 2);


    // Format dates to YYYY-MM-DD
    const to = toDate.toISOString().split('T')[0];
    const from = fromDate.toISOString().split('T')[0];

     // Construct the Polygon.io API URL
    const polygonURL = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${polygonApiKey}`;
   
    // Fetch the historical data from Polygon.io
    const polygonResponse = await axios.get(polygonURL);

    // Send the transformed data to the client
    res.json(polygonResponse.data);
  } catch (error) {
    console.error("Error fetching historical data:", error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/news/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const apiKey = process.env.FINNHUB_API_KEY;
  const toDate = new Date().toISOString().split('T')[0]; // Current date
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 7); // 7 days ago
  const fromDateISO = fromDate.toISOString().split('T')[0];

  try {
    const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDateISO}&to=${toDate}&token=${apiKey}`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching company news:", error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/insider-sentiment/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const apiKey = process.env.FINNHUB_API_KEY;

  try {
    const url = `https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${symbol}&token=${apiKey}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching insider sentiment data:", error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/company-recommendation/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const apiKey = process.env.FINNHUB_API_KEY;

  try {
    // Fetch company recommendation trend data from Finnhub API
    const response = await axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${apiKey}`);
    const recommendationData = response.data;

    // Send the recommendation data back to the client
    res.json(recommendationData);
  } catch (error) {
    console.error('Error fetching company recommendation trend:', error);
    res.status(500).json({ error: 'Error fetching company recommendation trend' });
  }
});

app.get('/api/stock-earnings/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const apiKey = process.env.FINNHUB_API_KEY;

  try {
    // Fetch company recommendation trend data from Finnhub API
    const url = `https://finnhub.io/api/v1/stock/earnings?symbol=${symbol}&token=${apiKey}`;
    const response = await axios.get(url);
    const recommendationData = response.data;

    // Send the recommendation data back to the client
    res.json(recommendationData);
  } catch (error) {
    console.error('Error fetching company recommendation trend:', error);
    res.status(500).json({ error: 'Error fetching company recommendation trend' });
  }
});

// API endpoint for autocomplete suggestions based on a query
app.get('/api/autocomplete', async (req, res) => {
  const query = req.query.q; // Get the query parameter from the URL
  const apiKey = process.env.FINNHUB_API_KEY;

  // Construct the URL for the Finnhub search endpoint
  const searchUrl = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${apiKey}`;

  try {
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Fetch data from Finnhub API
    const response = await axios.get(searchUrl);

    // Return the search results to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- MongoDB Atlas Watchlist --- //
app.post('/api/watchlist', async (req, res) => {
  const { symbol } = req.body;

  try {
    // Connect the client to the server
    await client.connect();

    const database = client.db("HW3");
    const collection = database.collection("watchlist");

    // Insert the stock symbol into the watchlist collection
    const result = await collection.insertOne({ symbol });

    res.status(200).json({ message: `${symbol} added to watchlist.` });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Endpoint to remove a stock from the watchlist by symbol
app.delete('/api/watchlist/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
    // Connect to MongoDB
    await client.connect();

    // Access the watchlist collection
    const database = client.db("HW3");
    const collection = database.collection("watchlist");

    // Delete the stock from the watchlist collection
    const result = await collection.deleteOne({ symbol });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: `${symbol} removed from watchlist.` });
    } else {
      res.status(404).json({ error: `${symbol} not found in watchlist.` });
    }
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Close MongoDB connection
    await client.close();
  }
});

// MongoDB Atlas API to check if stock is in watchlist
app.get('/api/stock-status/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
    // Connect to MongoDB
    await client.connect();

    // Access the watchlist collection
    const database = client.db("HW3");
    const collection = database.collection("watchlist");

    // Query for the stock symbol in the collection
    const stock = await collection.findOne({ symbol });

    // If the stock is found, return true; otherwise, return false
    if (stock) {
      res.status(200).json({ inWatchlist: true });
    } else {
      res.status(200).json({ inWatchlist: false });
    }
  } catch (error) {
    console.error('Error querying watchlist:', error);
    res.status(500).json({ error: 'Internal server error' });
    await client.close();
  }
});

// MongoDB Atlas API to get all stocks in watchlist
app.get('/api/stocks-watchlist', async (req, res) => {
  try {
    // Connect to MongoDB
    await client.connect();
    
    const database = client.db("HW3"); // Replace "HW3" with your database name
    const collection = database.collection("watchlist"); // Replace "watchlist" with your collection name

    const stocks = await collection.find({}, { projection: { _id: 0, symbol: 1 } }).toArray();

    // Extract just the symbols from the query results
    const symbols = stocks.map(stock => stock.symbol);

    res.json(symbols);
  } catch (error) {
    console.error('Error fetching stock symbols:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to get the balance from the portfolio collection
app.get('/api/portfolio/balance', async (req, res) => {
  try {
    // Connect to MongoDB
    await client.connect();

    // Access the portfolio collection
    const database = client.db("HW3");
    const collection = database.collection("account");
    const balanceDocument = await collection.findOne({});

    // Check if a balance document is found
    if (balanceDocument) {
      res.status(200).json({ balance: balanceDocument.balance });
    } else {
      res.status(404).json({ message: 'Balance information not found' });
    }
  } catch (error) {
    console.error('Error querying portfolio balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Close the MongoDB connection
    // await client.close();
  }
});

app.get('/api/portfolio', async (req, res) => {
  try {
    await client.connect();
    const database = client.db("HW3");
    const collection = database.collection("portfolio");

    // Fetch all documents in the portfolio collection
    const stocksCursor = await collection.find({});
    const stocks = await stocksCursor.toArray();

    // Transform the documents into the desired format
    const portfolio = stocks.map(stock => ({
      symbol: stock.data.symbol, // Assuming each document has a symbol field
      quantity: stock.data.quantity,
      totalCost: stock.data.totalCost
    }));

    res.status(200).json(portfolio);
  } catch (error) {
    console.error('Error retrieving portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // await client.close();
  }
});

// API endpoint to buy stock
app.post('/api/buy', async (req, res) => {
  try {
    await client.connect();
    const database = client.db("HW3");
    const collection = database.collection("portfolio");
    const accountCollection = database.collection("account");
    let { symbol, quantity, totalCost } = req.body;
    totalCost = Math.round(totalCost * 100) / 100;

    // Check if the stock is already purchased
    const existingStock = await collection.findOne({ 'data.symbol': symbol });
    if (existingStock) {
      // Calculate updated quantity and total cost
      const updatedQuantity = parseInt(existingStock.data.quantity + quantity);
      const updatedTotalCost = existingStock.data.totalCost + totalCost;

      // Update the document in the collection based on the symbol
      await collection.updateOne(
        { 'data.symbol': symbol },
        { $set: { 'data.quantity': updatedQuantity, 'data.totalCost': updatedTotalCost } }
      );

      res.status(200).json({ message: 'Stock updated successfully' });
    } else {
      // Add new document to collection
      await collection.insertOne({ data: { symbol, quantity, totalCost } });
      res.status(201).json({ message: 'Stock purchased successfully' });
    }
    // Update the balance in the account collection
    const balance = await accountCollection.findOne({});
    const updatedBalance = balance.balance - parseFloat(totalCost).toFixed(2); // Subtract total cost from balance
    await accountCollection.updateOne(
      {},
      { $set: { balance: updatedBalance } }
    );
  } catch (error) {
    console.error('Error buying stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // await client.close();
  }
});

// API endpoint to sell stock
app.post('/api/sell', async (req, res) => {
  try {
    await client.connect();
    const database = client.db("HW3");
    const collection = database.collection("portfolio");
    const accountCollection = database.collection("account");
    let { symbol, quantity, totalCost } = req.body;
    totalCost = Math.round(totalCost * 100) / 100;

    // Check if the stock is already purchased
    const existingStock = await collection.findOne({ 'data.symbol': symbol });
    if (existingStock) {
      // Calculate updated quantity and total cost
      const updatedQuantity = existingStock.data.quantity - quantity;
      const updatedTotalCost = existingStock.data.totalCost - totalCost;

      // Update the document in the collection based on the symbol
      await collection.updateOne(
        { 'data.symbol': symbol },
        { $set: { 'data.quantity': updatedQuantity, 'data.totalCost': parseFloat(updatedTotalCost) } }
      );

      // Update the balance in the account collection
      const balance = await accountCollection.findOne({});
      const updatedBalance = balance.balance + parseFloat(totalCost); // Add total cost to balance
      await accountCollection.updateOne(
        {},
        { $set: { balance: updatedBalance } }
      );

      if (updatedQuantity <= 0) {
        await collection.deleteOne({ 'data.symbol': symbol });
      }

      res.status(200).json({ message: 'Stock sold successfully' });
    } else {
      res.status(400).json({ error: 'Stock not found in portfolio' });
    }
  } catch (error) {
    console.error('Error selling stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // await client.close();
  }
});

// API endpoint to check if a stock symbol is in the portfolio and return the quantity
app.post('/api/portfolio/check', async (req, res) => {
  try {
    // Connect to the MongoDB client and database
    await client.connect();
    const database = client.db("HW3");
    const collection = database.collection("portfolio");

    // Get the stock symbol from the request body
    const { symbol } = req.body;

    // Search for the stock symbol in the portfolio collection
    const existingStock = await collection.findOne({ 'data.symbol': symbol });

    if (existingStock) {
      // If the stock symbol is found, return the quantity associated with it
      res.status(200).json({ quantity: existingStock.data.quantity });
    } else {
      // If the stock symbol is not found, return a message indicating that it's not in the portfolio
      res.status(200).json({ message: 'Stock symbol not found in the portfolio' });
    }
  } catch (error) {
    // If an error occurs, log the error and return an internal server error status
    console.error('Error checking stock symbol in portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Close the MongoDB client connection
    // await client.close();
  }
});


// --- Server Configuration -- //
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});

// Handles any requests that don't match the API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './build/index.html'));
});
