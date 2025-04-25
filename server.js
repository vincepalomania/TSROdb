// backend/server.js
const express = require('express');
const morgan = require('morgan');
const fuelRoutes = require('./routes/fuelroutes');
const methodOverride = require('method-override');

const app = express();

//MIDDLEWARES
app.use(morgan('dev'));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.json());

app.get('/', (req, res) => {
  res.redirect('/station/fuel');
});

app.use('/station', fuelRoutes);

app.set("view engine", "ejs");
// app.set("views", "./views")

app.listen(3000, () => {
  console.log('Backend server running on http://localhost:3000');
});