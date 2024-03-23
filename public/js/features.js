import axios from 'axios';
import { showAlert } from './alerts';

export const getTop5CheapTours = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/tours/top-5-cheap',
    });

    if (res.data.status === 'success') {
      location.assign('/');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
