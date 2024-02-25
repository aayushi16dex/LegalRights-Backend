const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const path = require('path');
app.use(cors());
require('dotenv').config();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Database connection
mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected successfully'))
  .catch((err) => { console.error(err); });

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.send('Server is running');
});
app.get('/passwordReset/:token/:id', (req, res) => {
  res.sendFile(__dirname + '/utils/htmlPage/newPassword.html');
});
// Routes
const userRoute = require('./routes/userRoute')
const organisationRoute = require('./routes/organisationRoute')
const askExpertRoute = require('./routes/askExpertRoute');
const legalExpertRoute = require('./routes/legalExpertRoute');
const adminRoute = require('./routes/adminRoute')
const legalContentRoute = require('./routes/legalContentRoute')

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/utils', express.static(path.join(__dirname, 'utils')))
app.use('/user', userRoute);
app.use('/organisation', organisationRoute );
app.use('/expert', legalExpertRoute);
app.use('/askExpert', askExpertRoute);
app.use('/admin', adminRoute);
app.use('/content', legalContentRoute)

app.listen(process.env.PORT, () => console.log("Server is running"));