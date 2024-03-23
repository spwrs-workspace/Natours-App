import axios from 'axios';
import { showAlert } from './alerts';
import catchAsync from '../../utils/catchAsync';

//type is either 'password' or 'data'
export const updateSettings = catchAsync(async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} Updated Successfully`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
});
