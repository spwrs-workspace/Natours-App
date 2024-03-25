const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');

exports.getOverview = catchAsync(async (req, res, next) => {
  //1) get the tours data from the collection
  const tours = await Tour.find();

  //2) build the template

  //3) render the template with the tour data from step 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    page: 'overview',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1) get the tour
  const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate({
    path: 'reviews',
    fields: 'rating review user',
  });

  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }
  //console.log(tour);
  //2) Build the template

  //3) render the template with tour data
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your Account',
    page: 'login',
  });
};

exports.getSignUpForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create Account',
    page: 'signup',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

exports.getForgotpasswordForm = (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot Password',
    page: 'forgotPassword',
  });
};

exports.getResetpasswordForm = (req, res) => {
  res.status(200).render('resetPassword', {
    title: 'Reset Password',
    page: 'resetPassword',
  });
};

exports.getMyBookedTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user._id });

  //console.log(bookings);

  const tourIds = bookings.map((el) => el.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Bookings',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  });
});

exports.getTop5CheapTours = async (req, res) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const features = new ApiFeatures(Tour.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  //const docs = await features.query.explain();
  const tours = await features.query;

  // console.log(tours);

  res.status(200).render('overview', {
    title: 'Top 5️⃣ Cheap',
    page: 'top5',
    tours,
  });
};

exports.getAllToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // console.log(latlng);
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return new AppError(
      'provide latitude and longitude in the form lat, lng',
      400,
    );
  }

  //console.log(distance, lat, lng, unit);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  // console.log(tours);

  res.status(200).render('overview', {
    title: 'Tours Near Me',
    page: 'Tours-Near-Me',
    tours,
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return new AppError(
      'provide latitude and longitude in the form lat, lng',
      400,
    );
  }

  const tours = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },

        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
        imageCover: 1,
        slug: 1,
      },
    },
  ]);

  // console.log(tours);

  res.status(200).render('distances', {
    title: 'Tour Distances',
    tours,
  });
});
