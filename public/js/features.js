import axios from 'axios';
import { showAlert } from './alerts';

export const getLocation = () => {
  if (window.navigator) {
    //geolocation available

    window.navigator.geolocation.getCurrentPosition(
      successCallBack,
      failureCallBack,
    );
  }
};

export const getLocation1 = () => {
  if (window.navigator) {
    //geolocation available

    window.navigator.geolocation.getCurrentPosition(
      successCallBack1,
      failureCallBack,
    );
  }
};

const successCallBack = async (position) => {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  // console.log(latitude, longitude);

  const url = `/tours-within/8000/center/${latitude},${longitude}/unit/mi`;

  try {
    const res = await axios({
      method: 'GET',
      url,
    });

    // console.log(res);
    document.documentElement.innerHTML = res.data;
  } catch (err) {
    // console.log(err);
    showAlert('error', err.response.data.message);
  }
};

const successCallBack1 = async (position) => {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  // console.log(latitude, longitude);

  const url = `/distances/${latitude},${longitude}/unit/mi`;

  // console.log(url);
  try {
    const res = await axios({
      method: 'GET',
      url,
    });

    // console.log(res);
    document.documentElement.innerHTML = res.data;
  } catch (err) {
    // console.log(err);
    showAlert('error', err.response.data.message);
    // showAlert('error', err.response.data);
  }
};

const failureCallBack = (error) => {
  //   console.log(error);
  showAlert('error', error.message);

  window.setTimeout(() => {
    location.assign('/');
  }, 1500);
};
