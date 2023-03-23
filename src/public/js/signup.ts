import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (
  name: string,
  email: string,
  password: string,
  passwordConfirm: string
) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: { name, email, password, passwordConfirm },
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Account created successfully! Please check your email to verify your account.'
      );
      window.setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
  } catch (err: any) {
    showAlert('error', err.response.data.message);
  }
};
