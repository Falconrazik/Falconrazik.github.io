const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://hqvu:Vuhuy%401011@cluster0.ckvljpo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToMongoDB() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // Rethrow the error to handle it elsewhere
  }
}

async function closeMongoDBConnection() {
  try {
    // Close the MongoDB connection
    await client.close();
    console.log("MongoDB connection closed successfully.");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    throw error; // Rethrow the error to handle it elsewhere
  }
}


async function testMongoDBConnection() {
    try {
      // Connect the client to the server
      await client.connect();
  
      // Send a ping to confirm a successful connection
      const pingResult = await client.db("admin").command({ ping: 1 });
  
      console.log("Ping result:", pingResult);
    } catch (error) {
      console.error("Error testing MongoDB connection:", error);
    } finally {
      // Close the MongoDB connection
      await client.close();
    }
  }
  
  // Call the test function
  testMongoDBConnection();

// Export the client object and the connection functions
module.exports = { client, connectToMongoDB, closeMongoDBConnection };
