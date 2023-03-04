/* eslint-disable @typescript-eslint/no-unused-vars */
import Review from '../models/reviewModel';
import { RequestHandler } from 'express';
import catchAsync from '../utils/catchAsync';
import * as factory from './handleFactory';
import AppError from '../utils/appError';

export const getAllReviews = factory.getAll(Review);

// export const getAllReviews: RequestHandler = catchAsync(
//   async (req, res, next) => {
//     let filter = {};
//     if (req.params.tourId) filter = { tour: req.params.tourId };

//     const reviews = await Review.find(filter);

//     res
//       .status(200)
//       .json({ message: 'success', results: reviews.length, data: reviews });
//   }
// );

// export const createReview: RequestHandler = catchAsync(
//   //Allow nested routes
//   async (req, res, next) => {
//     if (!req.body.tour) req.body.tour = req.params.tourId;
//     //We ware getting req.user from the protect middleware
//     if (!req.body.user) req.body.user = req.user.id;
//     const newReview = await Review.create(req.body);
//     res.status(200).json({ message: 'success', data: { review: newReview } });
//   }
// );

//Creating a middleware with next() for the above function

export const setTourUserIds: RequestHandler = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  //     //We ware getting req.user from the protect middleware
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

export const getReview = factory.getOne(Review);

export const createReview = factory.createOne(Review);

export const updateReview = factory.updateOne(Review, ['review', 'rating']);

export const deleteReview = factory.deleteOne(Review);
