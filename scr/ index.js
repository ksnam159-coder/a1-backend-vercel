// File: index.js
const express = require('express');
const cors = require('cors');
const apiHandler = require('./api/ratings.js').default; // Import hàm handler

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // Sử dụng CORS
app.use(express.json());

// Định tuyến tất cả các request đến /api/ratings cho handler của bạn
app.all('/api/ratings', apiHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});