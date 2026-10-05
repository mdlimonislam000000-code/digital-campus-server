const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// মিডলওয়্যার
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }    
});

let usersCollection;

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });  
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const database = client.db("digital_campus"); 
        usersCollection = database.collection("users");

    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
    }
}

run().catch(console.dir);

// রুট রাউট
app.get('/', (req, res) => {
  res.send('Digital Campus Server is running!');
});

// ইমেইল দিয়ে ইউজারের স্ট্যাটাস জানার API
app.get('/api/users/email/:email', async (req, res) => {
  try {
    const email = req.params.email;
    
    if (!usersCollection) {
      return res.status(500).json({ success: false, message: 'Database not connected yet' });
    }

    const user = await usersCollection.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: user.status || 'active',
        suspendUntil: user.suspendUntil || null,
        role: user.role,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Error fetching user status:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error' 
    });
  }
});

app.listen(port, () => {
  console.log(`Digital Campus app listening on port ${port}`);
});