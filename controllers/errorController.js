const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  //console.log(err);
  const message = `Duplicate name entry: ${err.keyValue.name}. Please enter different one`;
  //console.log(message);
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid fields : ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Please provide valid token', 401);

const handleJWTExpiredError = () =>
  new AppError('Your session timed out. please login again!', 401);

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    //Operational error or trusted error : send error to client
    if (err.isOperational) {
      //console.log(err);
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,

        //Programming or other unknowns errors : dont leak details
      });
    }

    //1) Log the error so it will be loggged to the deployed environments console
    console.error('ERROR 💥', err);

    //2) show generic message
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error (programming or any other)',
    });
  }

  //Rendered website
  //Operational error or trusted error : send error to client
  if (err.isOperational) {
    //console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
    //Programming or other unknowns errors : dont leak details
  }

  //1) Log the error so it will be loggged to the deployed environments console
  // console.error('ERROR 💥', err);

  //2) show generic message

  return res.status(500).render('error', {
    title: 'Something went wrong',
    msg: 'Internal server error (programming or any other)',
  });
};

const sendErrorDev = (err, req, res) => {
  //console.log(this.err, this.stack)

  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Rendered website
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  //console.log(err.message);
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name, message: err.message };
    //console.log(error.name);
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateFieldDB(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, req, res);
  } else if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  }
};
