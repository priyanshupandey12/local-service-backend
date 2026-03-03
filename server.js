require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./src/router/user.router');
const providerRoutes = require('./src/router/provider.router');
const bookingRoutes = require('./src/router/booking.router');
const reviewRoutes = require('./src/router/review.router');
const adminRoutes = require('./src/router/admin.router');
const categoryRoutes = require('./src/router/category.router');

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/provider', providerRoutes);
app.use('/api/v1/booking', bookingRoutes);
app.use('/api/v1/review', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/categories', categoryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})