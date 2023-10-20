const express = require('express');
const app = express();
const NotifierService = require("./NotifierService.js");
const notifier = new NotifierService();
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const bodyParser = require('body-parser'); // Middleware for parsing JSON data
const helmet = require('helmet');
const routes = require("./routes");
const http = require('http'); // Import the http module
const expressWs = require('express-ws')(app); // Import express-ws

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      // Add more directives as needed
    },
  })
);
const allowedOrigins = [
  'http://localhost:3000', 
  'https://santibello.es', 
  'https://santibello.es/michiapp',
  'wss://localhost:3500', 
  'wss://michiapp-express.onrender.com'
];

app.use(cors({
  origin: allowedOrigins,
}));

const server = http.createServer(app); // Create an HTTP server
notifier.connect(server);

app.use(express.json());
app.use(bodyParser.json({ limit: '5mb' })); // Adjust the limit as needed
app.use('/api', userRoutes);
app.use(routes(notifier))

const port = process.env.PORT || 3500;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});