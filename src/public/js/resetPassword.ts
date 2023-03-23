import axios from 'axios';
import { showAlert } from './alerts';

export const resetPassword = async (
  password: string,
  passwordConfirm: string,
  token: string
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetPassword/${token}`,
      data: { password, passwordConfirm },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Password reset successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
  } catch (err: any) {
    showAlert('error', err.response.data.message);
  }
};
