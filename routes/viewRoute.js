const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const tourController = require('../controllers/tourController');

const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview,
);

router.get(
  '/tour/:tourSlug',
  authController.isLoggedIn,
  viewsController.getTour,
);

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', viewsController.getSignUpForm);

router.get('/forgot-password', viewsController.getForgotpasswordForm);
router.get('/reset-password/:resetToken', viewsController.getResetpasswordForm);

router.get('/me', authController.protect, viewsController.getAccount);

router.get(
  '/best-selling',
  tourController.aliasTopTours,
  viewsController.getTop5CheapTours,
);

router.get(
  '/my-tours',
  authController.protect,
  viewsController.getMyBookedTours,
);

router.post(
  '/update-userData',
  authController.protect,
  viewsController.updateUserData,
);

router.get(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  viewsController.getAllToursWithin,
);

router.get('/distances/:latlng/unit/:unit', viewsController.getDistances);

module.exports = router;
