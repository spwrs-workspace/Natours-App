import axios from 'axios';
import { showAlert } from './alerts';

const submitButton = document.getElementById('submmit--btn');

export const forgotPassword = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgotPassword',
      data: {
        email,
      },
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Password reset mail send successfully! Check your Gmail Account',
      );

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const resetPassword = async (password, passwordConfirm, resetToken) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetPassword/${resetToken}`,
      data: {
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Password Changed successfully!');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    // console.log(err.response.data.message);
    if (
      err.response.data.message ===
      'Invalid password reset token or it expired. Please try again'
    ) {
      showAlert('error', err.response.data.message);
      window.setTimeout(() => {
        location.assign('/forgot-password');
      }, 1500);
    } else {
      // console.log("i am here")
      showAlert('error', err.response.data.message);
      submitButton.textContent = 'Reset Password';
    }
  }
};
