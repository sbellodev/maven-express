const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const bodyParser = require('body-parser'); // Middleware for parsing JSON data
const helmet = require('helmet');

// Apply the CORS middleware before defining routes

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      // Add more directives as needed
    },
  })
);
const allowedOrigins = ['http://localhost:3000', 'https://santibello.es', 'https://santibello.es/michiapp'];
app.use(cors({
  origin: allowedOrigins,
}));



// Use the user routes
app.use(express.json());
app.use(bodyParser.json({ limit: '5mb' })); // Adjust the limit as needed
app.use('/api', userRoutes);

const port = process.env.PORT || 3500;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});