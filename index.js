

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 5000 




//Routes Import
const authRoutes = require('./routes/auth.routes'); 
const userRoutes = require('./routes/users.routes');
const propertyRoutes = require('./routes/properties.routes');
const visitRoutes = require('./routes/visits.routes');
const transactionRoutes = require('./routes/transactions.routes');





//Middleware import
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middlewares/authMiddleware')
const roleMiddleware = require('./middlewares/roleMiddleware')



// Add body-parser middleware
app.use(
  bodyParser.urlencoded({
    limit: '10mb',
    parameterLimit:300,
  })
);

app.use(
  bodyParser.json({
    limit: '100mb'
  })
);

// Add CORS middleware
app.use(cors({
  origin: `http://localhost:${PORT}`,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-KEY',
    'X-Session-ID'
  ],
  exposedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Session-ID'
  ]
}));


// MongoDb connection
mongoose.connect('mongodb://localhost:27017/hohaya')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Connexion failed :', err);
  });





// Define a simple route
app.get('/', (req, res) => {
  console.log('Request GET received at /',req);
  res.json({ 
    success: true,
    message: 'Hello World! from the backend'
   });
});





//Users Routes
app.use('/users' , userRoutes)


//Properties routes
app.use('',propertyRoutes)


//Auth  login ,register and Token Generating
app.use("", authRoutes)


// Visits Route  
app.use('',visitRoutes)


// Transactions Route
app.use('' ,transactionRoutes);


      













// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});