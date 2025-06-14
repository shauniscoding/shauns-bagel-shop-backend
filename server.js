require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Schemas
const itemSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  rating: Number,
  price: Number
});

const menuSchema = new mongoose.Schema({
  title: String,
  slogan: String,
  image: String,
  items: [itemSchema]
});

const locationSchema = new mongoose.Schema({
  image: String,
  city: String,
  street: String,
  miles: String,
  phone: String,
  hours: String,
  address: String,
  geolocation: [Number],
})

const Menu = mongoose.model('Menu', menuSchema, 'menu');
const Location = mongoose.model('Location', locationSchema, 'locations');

// API key validation middleware (pls dont hack not sure this is secure)
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['api-key-1'];
    const apiKey2 = req.headers['api-key-2'];
    const apiKey3 = req.headers['api-key-3'];


  if (!apiKey || !apiKey2 || !apiKey3) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  if (apiKey !== process.env.API_KEY || apiKey2 !== process.env.API_KEY_2 || apiKey3 !== process.env.API_KEY_3) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }

  next();
};

// Routes
app.get('/', (req, res) => {
  res.send('Hello, Shaun’s Bagel Shop API!');
});

app.get('/menu/:title', validateApiKey, async (req, res) => {
  try {
    const { title } = req.params;
    const menu = await Menu.findOne({ title });

    if (!menu) {
      return res.status(404).json({ 
        error: 'Menu not found', 
      });
    }

    res.json(menu);
  } catch (err) {
    console.error('Error fetching menu:', err);
    res.status(500).json({ error: 'Internal Server Error' , details: err.message });
  }
});

app.get('/locations', validateApiKey, async (req, res) => {
  try {
    const locations = await Location.find({});
    res.json(locations);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//setting timeout to 3 minute to accout for probable cold starts on inactive server
server.setTimeout(180000);
