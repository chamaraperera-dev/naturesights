import axios from 'axios';
import { showAlert } from './alerts';

//type is either 'password' or 'data'
export const updateSettings = async (data: object, type: string) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/updateMyPassword'
        : 'http://localhost:3000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data: data,
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`
      );
    }
  } catch (err: any) {
    showAlert('error', err.response.data.message);
  }
};
