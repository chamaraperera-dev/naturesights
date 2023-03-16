import express from 'express';
import * as bookingController from '../controllers/bookingController';
import * as authController from '../controllers/authController';

const router = express.Router();

router.use(authController.protect);

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

//Giving access to only lead-guide and admin

router.use(authController.restrictTo('lead-guide', 'admin'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

export default router;
