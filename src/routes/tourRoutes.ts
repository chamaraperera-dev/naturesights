import express from 'express';

import * as tourController from '../controllers/tourController';

import * as authController from '../controllers/authController';

import reviewRouter from '../routes/reviewRoutes';

//Convention is to use the name as router

const router = express.Router();

//4th parameter is the value in Param middleware

// router.param('id', tourController.checkID);

//router is a middleware need to use .use to rerouted in to the reviewRouter
// app.use() adds middleware to the top-level application pipeline, while router.use() adds middleware to a specific router instance.

router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  // tours-distance?distance=233&center=-40,45&unit=mi
  // tours-distance/233/center/-40,45/unit/mi   -This is the standard way
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

//We don't need distance because we are not searching for a radius
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/')
  //Exposing get tours to other websites
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

//When submitting a new POST request

//POST /tour/234fad4/reviews
//GET /tour/234fad4/reviews
//GET /tour/234fad4/reviews/94887fda

export default router;
