import express from 'express';
import * as viewsController from '../controllers/viewsController';
import * as authController from '../controllers/authController';

const router = express.Router();

router.use(viewsController.alerts);

//using the isLoggedIn middleware to check if the user is logged in or not with every request

router.get(
  '/',
  //No need to use below function because we are using stripe webhooks
  // bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

router.get('/signup', viewsController.getSignUpForm);

router.get('/me', authController.protect, viewsController.getAccount);

router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.get('/my-reviews', authController.protect, viewsController.getMyReviews);

router.get('/forgot-password', viewsController.getForgotPasswordForm);

router.get(
  '/email-confirm/:token',
  authController.isVerified,
  viewsController.verifyEmail
);

router.get('/reset-password/:token', viewsController.getResetPasswordForm);

// router.post(
//   '/submit-user-data',
//   authController.protect,
//   viewsController.updateUserData
// );

export default router;
