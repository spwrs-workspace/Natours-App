const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const cookieOptions = {
  // expires: new Date(
  //   Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  // ),
  httpOnly: true,

  maxAge: 3600 * 1000,
  //secure:true
};

if (process.env.NODE_ENV === 'production') {
  cookieOptions.secure = true;
}

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // console.log('in the signup route in authcontroller')
  //const newUser=  await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createAndSendToken(newUser, 201, res);
  // const token= signToken(newUser._id);
  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data:{
  //     user: newUser
  //   }
  // })
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if the email and password is provided
  if (!email || !password) {
    return next(new AppError('please give your email and password', 400));
  }

  //2) check if the user exist and provided correct password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Either email or password is incorrect', 401));
  }

  //console.log(user);

  //3) if everything ok, send jwt to the user
  createAndSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000),
  });

  res.status(200).json({
    status: 'success',
  });
};

exports.isLoggedIn = async (req, res, next) => {
  //1) check if the token is send
  if (req.cookies.jwt) {
    //2) verification of token
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      //3) check if the user exists
      const freshUser = await User.findById(decoded.id);
      //console.log(freshUser);

      if (!freshUser) {
        return next();
      }
      //4) check if user has changed the password after receiving the token
      //console.log(freshUser);
      if (freshUser.passwordChangedAfter(decoded.iat)) {
        return next();
      }

      //User should be logged in here
      res.locals.user = freshUser;
      return next();
    } catch (error) {
      return next();
    }
  }

  next();
};

exports.protect = catchAsync(async (req, res, next) => {
  //1) check if the token is send
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  //console.log(token);

  if (!token) {
    return next(
      new AppError('You are not loged in. please login to get access', 401),
    );
  }
  //2) verification of token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //console.log(decoded);

  //3) check if the user exists
  const freshUser = await User.findById(decoded.id);
  //console.log(freshUser);

  if (!freshUser) {
    return next(
      new AppError('user belonging to this token does not exist', 401),
    );
  }
  //4) check if user has changed the password after receiving the token
  //console.log(freshUser);
  if (freshUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError(
        'You have recently changed your password. please login again',
        401,
      ),
    );
  }

  //manipulating req object so that we can acheive authorization in future by using users role
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles will be array

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You dont have right to do this action', 403));
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get the user from email

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('User with provided email does not exists', 404));
  }

  //2) generate the password reset token
  const resetToken = user.createPasswordResetToken();
  // console.log(resetToken);
  await user.save({
    validateBeforeSave: false,
  });

  //3) send reset token with mail

  try {
    // await sendEmail({
    //   to: 'sspwr1502@gmail.com',
    //   subject: 'Password reset link by ... (will expire in 10 min)',
    //   message
    // })

    // const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    // console.log(resetUrl);

    await new Email(user, resetUrl).sendPasswordResetToken();

    res.status(200).json({
      status: 'success',
      message: 'Password reset email send successfully',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    return next(
      new AppError(
        'Error during sending mail. please try after few minutes',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get the user from reset token and validate for the resetToken expirey
  // console.log(req.params.token);
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //console.log(hashedToken);
  // const user = await User.findOne({
  //   passwordResetToken: hashedToken,
  //   passwordResetExpires: { $gt: Date.now() },
  // });
  const user = await User.findOne({
    passwordResetToken: hashedToken,
  });

  //2)if not getting user log error
  // console.log(user);
  if (!user) {
    return next(
      new AppError(
        'Invalid password reset token or it expired. Please try again',
        400,
      ),
    );
  }

  // console.log(Date.parse(user.passwordResetExpires), Date.now());
  if (Date.parse(user.passwordResetExpires) < Date.now()) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'Invalid password reset token or it expired. Please try again',
        400,
      ),
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //3) update passwordChanged at field
  //this will be done at mongooses pre save hook in model.js

  createAndSendToken(user, 200, res);
  //4) login the user
  // const token= signToken(user._id);

  // res.status(200).json({
  //   status:'success',
  //   token
  // })
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  //1) get the user by using id
  const user = await User.findById(req.user._id).select('+password');

  //2) verify posted password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  //3) set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4) log in the user
  createAndSendToken(user, 200, res);
});
