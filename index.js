const app = require('./app');
const port = process.env.PORT || 3500;

const pool = require('./db'); // Import your database connection

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});