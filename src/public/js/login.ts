import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email: string, password: string) => {
  try {
    const res = await axios({
      method: 'POST',
      // If we are using website and api in the same url then we can use relative url
      url: '/api/v1/users/login',
      data: { email, password },
    });
    const data = res.data;
    if (data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err: any) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      // url: 'http://localhost:3000/api/v1/users/logout',
      // If we are using website and api in the same url then we can use relative url
      url: '/api/v1/users/logout',
    });
    //location.reload(true) Reload from server instead of browser cache
    if (res.data.status === 'success') location.reload();
  } catch (err: any) {
    showAlert('error', 'Error logging out! Try again.');
  }
};
