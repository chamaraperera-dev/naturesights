/* eslint-disable @typescript-eslint/no-unused-vars */
import Tour from '../models/tourModel';
import User from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import { RequestHandler } from 'express';
import AppError from '../utils/appError';

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