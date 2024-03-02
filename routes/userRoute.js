const express = require('express');
const authController= require('../controllers/authController');
const userController= require('../controllers/userController');


// const {
//   getAllUsers,
//   getUser,
//   createUser, 
//   updateUser,
//   deleteUser
// } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

//password reset functionality
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);


//all the middlewares after this needs to be protected
router.use(authController.protect);

router.patch('/updateMyPassword',  authController.updateMyPassword);

router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);

router.delete('/deleteMe', userController.deleteMe);


//router.route('/updateMyPassword').patch(authController.protect, authController.updateMyPassword)

router.get('/me',  userController.getMe, userController.getUser)

//admin should only get the access of the middlewares below this line hence
router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers).post(userController.createUser);

router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
