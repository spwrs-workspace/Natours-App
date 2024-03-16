/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const submitButton = document.getElementById('submmit--btn');

export const signUp = async (formData) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        email: formData.email,
        role: formData.role,
        name: formData.name,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Signed Up successfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    submitButton.textContent = 'Sign Up';
  }
};
