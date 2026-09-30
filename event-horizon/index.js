const express = require('express');
const connectDB = require('./src/configs/db');
const userRoutes = require('./src/routes/user.routes');
const profileRoutes = require('./src/routes/user.profile.routes');
const morgan = require('morgan');
require('dotenv').config();



const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan('dev'));
app.use('/api/auth', userRoutes);  
app.use('/api/user', profileRoutes);


connectDB();

app.get('/', (req, res) => {
  res.send('Hello, Peepoo!');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});