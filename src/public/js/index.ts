import { login, logout } from './login';
import { signup } from './signup';
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';

interface Location {
  day: number;
  description: string;
  coordinates: [number, number];
}

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateDataForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-password');
const signUpForm = document.querySelector('.form--signup');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)
      ?.value;
    login(email, password);
  });
}

if (mapBox) {
  if (!mapBox.dataset.locations) {
    throw new Error('Location data not found');
  } else {
    const locations: Location[] = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
  }
}

// DELEGATION;
if (mapBox) {
  if (!mapBox.dataset.locations) {
    throw new Error('Location data not found');
  } else {
    const locations: Location[] = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
  }
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (updateDataForm) {
  updateDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    updateSettings({ name, email }, 'data');
  });
}
if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const savePasswordBtn = document.querySelector('.btn-save-password');

    if (savePasswordBtn) {
      savePasswordBtn.textContent = 'Updating...';
    }
    const passwordCurrent = (
      document.getElementById('password-current') as HTMLInputElement
    ).value;
    const password = (document.getElementById('password') as HTMLInputElement)
      .value;
    const passwordConfirm = (
      document.getElementById('password-confirm') as HTMLInputElement
    ).value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    if (savePasswordBtn) {
      savePasswordBtn.textContent = 'Save password';
    }

    (document.getElementById('password-current') as HTMLInputElement).value =
      '';
    (document.getElementById('password') as HTMLInputElement).value = '';
    (document.getElementById('password-confirm') as HTMLInputElement).value =
      '';
  });
}

if (signUpForm) {
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement)
      .value;
    const passwordConfirm = (
      document.getElementById('password-confirm') as HTMLInputElement
    ).value;
    signup(name, email, password, passwordConfirm);
  });
}
