const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const morgan = require('morgan');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoute');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// global middleware
app.use(cors());

app.options('*', cors());

//serve static files on the server
app.use(express.static(path.join(__dirname, 'public')));

//set security http headers
// app.use(helmet());
app.use(helmet({ contentSecurityPolicy: false }));

//logging to development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//app.use(morgan('dev'));

//Body parser, to parse body into req.body
app.use(
  express.json({
    limit: '10kb',
  }),
);
app.use(cookieParser());
// to parse the urlencoded data coming from form
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  }),
);

//data sanitization against NoSql query injection  "email": {"$gt": ""}
app.use(mongoSanitize());

//data sanitization against xss atacks
app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'ratingsAverage',
      'ratingsQuantity',
      'difficulty',
      'maxGroupSize',
    ],
  }),
);

//limiting no of requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this I/P. please try again after an hour',
});

app.use('/api', limiter);

app.use(compression());

app.use((req, res, next) => {
  // console.log(req.cookies);
  //console.log('Hello from the middleware');
  next();
});

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl}`,
  // });

  //const err= new Error(`Can't find ${req.originalUrl}`);
  // err.statusCode=404;
  // err.status= "fail";

  // next(err);

  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
