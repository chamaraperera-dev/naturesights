/* eslint-disable @typescript-eslint/consistent-type-definitions */
import express from 'express';
import morgan from 'morgan';
import AppError from './utils/appError';
import globalErrorHandler from './controllers/errorController';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
//Exporting app to supertest
const app = express();

import tourRouter from './routes/tourRoutes';
import userRouter from './routes/userRoutes';
import reviewRouter from './routes/reviewRoutes';

//1.GLOBAL MIDDLEWARES

//Set security http headers

//when we call helmet() it will return a function waiting until it is called
//Need to place this one very early in the app
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit requests from same API
const limiter = rateLimit({
  //100 request per hour
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP,please try again in an hour',
});

//Apply to the all the routs starting with api
app.use('/api', limiter);

//Body parser, reading data from body into req.body
//Setting the size of the body to 10kb
app.use(express.json({ limit: '10kb' }));

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//Prevent parameter pollution
//In there area duplicate parameters only the last parameter will be used
//By using whitelist it will allow to use multiple parameters with the same name
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//Serving static files
app.use(express.static(`${__dirname}/public`));

//Need to use app.use to write middleware and there has to be a third argument (convention is next)
//Never forget to use next() in the middleware

//Test middleware
app.use((req, res, next) => {
  req.RequestTime = new Date().toISOString();
  next();
});

// Mounting routers
app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);

//Below code should be the last part of the route

/* created an interface "errorResponse" that extends the built-in Error class and adds two properties: "status" and "statusCode".
Then in your middleware function, you are creating a new Error object and casting it as the "errorResponse" interface using the "as" keyword. This allows you to set the "status" and "statusCode" properties on the error object, and TypeScript will recognize these properties as part of the class.
It's also important to note that, in this example, the middleware is passing the error to the next middleware using next(err) which allows another middleware to handle the error, it's important to have a middleware that handle the error and send response to the client. */

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));

  /*   const err = new Error(
    `Can't find ${req.originalUrl} on this server `
  ) as errorResponse;
  err.status = 'fail';
  err.statusCode = 404;
  next(err); */
});

app.use(globalErrorHandler);

export default app;
