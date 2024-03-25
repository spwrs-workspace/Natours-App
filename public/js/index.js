import '@babel/polyfill';
import { login, logout } from './login';
import { signUp } from './signUp';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { displayMap } from './mapBox';
import { forgotPassword, resetPassword } from './forgotPassword';
import { getLocation, getLocation1 } from './features';

// Elements
const loginForm = document.querySelector('.form--login');
const signUpForm = document.querySelector('.form--signup');
const mapBox = document.getElementById('map');
const logOut = document.querySelector('.nav__el--logout');
const updateDataForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const submitButton = document.getElementById('submmit--btn');
const forgotPasswordForm = document.querySelector('.form--forgot-password');
const resetPasswordForm = document.querySelector('.form--reset-password');
const toursNearMe = document.getElementById('tours-near-me');
const distanceFromPoint = document.getElementById('distance-from-point');

//delegations
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signUpForm) {
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitButton.textContent = 'Signing Up...';

    const name = document.getElementById('name').value;
    const role = document.getElementById('role').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    const formData = {
      name,
      role,
      email,
      password,
      passwordConfirm,
    };

    signUp(formData);
  });
}

if (mapBox) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}

if (logOut) {
  logOut.addEventListener('click', logout);
}

if (updateDataForm) {
  updateDataForm.addEventListener('submit', (e) => {
    //console.log('submit button clicked');
    e.preventDefault();

    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    //console.log('submit button clicked');
    //console.log(document.querySelector('.forpassword'));
    document.querySelector('.forpassword').textContent = 'Updating...';

    e.preventDefault();
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { currentPassword, password, passwordConfirm },
      'password',
    );

    document.querySelector('.forpassword').textContent = 'Save Password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitButton.textContent = 'Verifying...';
    const email = document.getElementById('email').value;
    forgotPassword(email);
  });
}
if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitButton.textContent = 'Updating...';

    // Get the current URL
    const currentUrl = window.location.href;

    // Extract the token from the URL
    const resetToken = currentUrl.split('/').pop(); // Assuming the token is the last part of the URL
    // console.log(resetToken);

    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    resetPassword(password, passwordConfirm, resetToken);
  });
}

if (toursNearMe) {
  toursNearMe.addEventListener('click', getLocation);
}

if (distanceFromPoint) {
  // console.log('got el');
  distanceFromPoint.addEventListener('click', getLocation1);
}
