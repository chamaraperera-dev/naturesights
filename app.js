const express = require('express');
const morgan = require('morgan');

const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//1.MIDDLEWARE

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

//To serve static files

app.use(express.static(`${__dirname}/public`));

//Need to use app.use to write middleware and there has to be a third argument (convention is next)
//Never forget to use next() in the middleware

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋🏻');
  next();
});

app.use((req, res, next) => {
  req.RequestTime = new Date().toISOString();
  next();
});

//Mounting routers
app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

module.exports = app;
