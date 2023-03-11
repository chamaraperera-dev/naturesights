/* eslint-disable @typescript-eslint/no-unused-vars */
//Express Error middleware handler.First argument is error

import AppError from '../utils/appError';
import { Request, Response, NextFunction } from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any) => {
  // const value = err.message.match(/"(.*?)"/)[0]; //Regular expression to get the string between quotes
  const value = err.keyValue.name;

  const message = `Duplicate field value: '${value}' Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: any) => {
  const errors: string[] = Object.values(err.errors).map(
    (el: any) => el.message
  );
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again', 401);

const sendErrorDev = (err: any, req: Request, res: Response) => {
  //Code without else statement using return
  // A) API
  if (req.originalUrl.startsWith('/api'))
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  //B) RENDERED WEBSITE
  console.log('ERROR', err);
  return res
    .status(err.statusCode)
    .render('error', { title: 'Something went wrong!', msg: err.message });
};

const sendGenericErrorMessage = (res: Response) => {
  return res
    .status(500)
    .json({ status: 'error', message: 'Something went wrong' });
};

const renderErrorMessage = (
  res: Response,
  title: string,
  message: string,
  statusCode: number
) => {
  return res.status(statusCode).render('error', { title, msg: message });
};

const sendErrorProd = (err: any, req: Request, res: Response) => {
  // A)API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational)
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    //Programming or other unknown error:don't leak error details

    //1) Log error
    console.log('ERROR', err);

    //2) Send generic error message
    return sendGenericErrorMessage(res);
  }

  // B)RENDERED WEBSITE
  // A) Operational error, trusted error: send message to client
  if (err.isOperational) {
    return renderErrorMessage(
      res,
      'Something went wrong!',
      err.message,
      err.statusCode
    );
  }

  //B) Programming or other unknown error:don't leak error details
  //1) Log error
  console.log('ERROR', err);

  //2) Send generic error message
  return renderErrorMessage(
    res,
    'Something went wrong!',
    'Please try again later',
    err.statusCode
  );
};

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log(err.stack); //err.stack will show where the error happened
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    //Creating hard copy of the error object using destructuring because it is not good to modify the original argument
    //error.name property will not be passed in to the error object therefore checking the name in the original object err.name
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    //error.message property will not be passed in to the error object created with destructuring  therefore sending the name in the original err object
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);

    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

export default globalErrorHandler;
