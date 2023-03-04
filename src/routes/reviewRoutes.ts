import express from 'express';
import * as reviewController from '../controllers/reviewController';
import * as authController from '../controllers/authController';

//To get the access the parameters of the other tourRoutes router
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    authController.checkIfOwner,
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    authController.checkIfOwner,
    reviewController.deleteReview
  );

export default router;
