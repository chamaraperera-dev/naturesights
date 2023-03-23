import axios from 'axios';
import { showAlert } from './alerts';

export const forgotPassword = async (email: string) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgotPassword',
      data: { email },
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Email sent successfully. Please check your email for to reset your password.'
      );
      window.setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
  } catch (err: any) {
    showAlert('error', err.response.data.message);
  }
};
