const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Serve static frontend files (if frontend build is in frontend/dist)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Route files
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const goalRoutes = require('./routes/goalRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai', aiRoutes);

// Fallback for frontend routing (if needed)
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
