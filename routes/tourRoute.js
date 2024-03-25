const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController= require('../controllers/reviewController');
const reviewRouter = require('./reviewRoute');

const router = express.Router();

// router.param('id', (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   next();
// });

//implementing nested routes
// router.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.createReview)

router.use('/:tourId/reviews', reviewRouter);

//router.param('id', tourController.checkID);
router
  .route('/best-selling')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'guide', 'lead-guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getAllToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/')
  // .get(catchAsync(tourController.getAllTours))
  .get(tourController.getAllTours)
  // .post(tourController.checkBody, tourController.createTour);
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
