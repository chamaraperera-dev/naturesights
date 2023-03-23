/* eslint-disable @typescript-eslint/no-unused-vars */
import Tour from '../models/tourModel';
import User from '../models/userModel';
import Booking from '../models/bookingModel';
import Review from '../models/reviewModel';
import catchAsync from '../utils/catchAsync';
import { RequestHandler } from 'express';
import AppError from '../utils/appError';
import * as authController from '../controllers/authController';

export const alerts: RequestHandler = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      'Your booking was successful! Please check your email for a confirmation. If your booking does not show up here immediately, please come back later.';

  next();
};

export const getOverview: RequestHandler = catchAsync(
  async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();

    // 2) Build template

    // 3) Render that template using tour data from 1)

    res.status(200).render('overview', {
      title: 'All tours',
      tours,
    });
  }
);

export const getTour: RequestHandler = catchAsync(async (req, res, next) => {
  //1) Get the data, for the requested tour (including reviews and guides)

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  if (!tour) return next(new AppError('There is no tour with that name.', 404));

  //2) Build template
  //3) Render template using data from 1)

  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

export const getLoginForm: RequestHandler = (req, res) => {
  res.status(200).render('login', { title: 'Log into your account' });
};

export const getSignUpForm: RequestHandler = (req, res) => {
  res.status(200).render('signup', { title: 'Signup' });
};

export const getAccount: RequestHandler = (req, res) => {
  res.status(200).render('account', { title: 'Your account' });
};

export const verifyEmail: RequestHandler = (req, res) => {
  res.status(200).render('verifiedEmail', { title: 'Email Verification' });
};

// export const updateUserData: RequestHandler = catchAsync(
//   async (req, res, next) => {
//     console.log('UPDATING USER', req.body);
//     const updatedUser = await User.findByIdAndUpdate(
//       req.user.id,
//       {
//         //name and email fields coming from the form
//         name: req.body.name,
//         email: req.body.email,
//       },
//       { new: true, runValidators: true }
//     );
//     res
//       .status(200)
//       //Important to send updated User to the template
//       .render('account', { title: 'Your account', user: updatedUser });
//   }
// );

export const getMyTours: RequestHandler = catchAsync(async (req, res, next) => {
  //1)Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  //2)Find tours with the returned IDs
  //Map will create an array of all the tour IDs
  const tourIDs = bookings.map((el: any) => el.tour);
  //Find all tours with the returned IDs using the $in operator
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render('overview', { title: 'My Tours', tours });
});

export const getMyReviews: RequestHandler = catchAsync(
  async (req, res, next) => {
    //1)Find all reviews
    //Virtually populated the tour field in the review model
    const reviews = await Review.find({ user: req.user.id });
    res.status(200).render('reviews', { title: 'My Reviews', reviews });
  }
);

export const getForgotPasswordForm: RequestHandler = (req, res) => {
  res.status(200).render('forgotPassword', { title: 'Forgot Password' });
};

export const getResetPasswordForm: RequestHandler = (req, res) => {
  const { token } = req.params;
  res.locals.token = token;
  res.status(200).render('resetPassword', { title: 'Reset Password' });
};
