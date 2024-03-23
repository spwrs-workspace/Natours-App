const Stripe = require('stripe');
const stripe = Stripe('sk_test_51OjM5GSEttJtDWP6l3O6JzfV1W7L77T67P8aChdX2zF2nnImAx3uGIPEiFBrgSUTdHBGS7TAkvRWblGqIvnL97yx00zkCcNlUw');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  
  // console.log(req.params.tourId);
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode:'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}?tour=${tour._id}&user=${req.user._id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://natours-app-nwmb.onrender.com/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1
      }
    ]
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next)=>{
  const {tour, user,  price}= req.query;

  if(!user || !tour || !price) return next();

  await Booking.create({tour, user, price});


  res.redirect(req.url.split('?')[0]);
})

exports.createBooking= factory.createOne(Booking)

exports.getAllBookings= factory.getAll(Booking)

exports.deleteBooking = factory.deleteOne(Booking);

exports.updateBooking= factory.updateOne(Booking);

exports.getBooking = factory.getOne(Booking);
