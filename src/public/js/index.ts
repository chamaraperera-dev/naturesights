import { login, logout } from './login';
import { signup } from './signup';
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

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
const bookBtn = document.getElementById('book-tour');

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
  //Show preview when user upload a photo
  const userImgEl = document.querySelector(
    '.form__user-photo'
  ) as HTMLImageElement;
  const userImgInputEl = document.getElementById('photo') as HTMLInputElement;

  const handleDisplayUserPhoto = (e: any) => {
    const imgFile = e.target.files?.[0];

    if (!imgFile?.type.startsWith('image/')) return;

    const reader = new FileReader();

    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string')
        userImgEl.setAttribute('src', reader.result);
    });

    reader.readAsDataURL(imgFile);
  };

  userImgInputEl.addEventListener('change', handleDisplayUserPhoto);

  updateDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append(
      'name',
      (document.getElementById('name') as HTMLInputElement).value
    );
    form.append(
      'email',
      (document.getElementById('email') as HTMLInputElement).value
    );

    const photoInput = document.getElementById('photo') as HTMLInputElement;

    const photoFile = photoInput?.files?.[0] || null;
    if (photoFile !== null) {
      form.append('photo', photoFile);
    }

    // const name = (document.getElementById('name') as HTMLInputElement).value;
    // const email = (document.getElementById('email') as HTMLInputElement).value;
    //AJAX request to update data recognize the form as an object
    await updateSettings(form, 'data');

    //Using async to reload the page after the update
    setTimeout(() => {
      location.reload();
    }, 1500);
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

if (bookBtn) {
  bookBtn.addEventListener('click', (e: any) => {
    e.target.textContent = 'Processing...';
    //To access data attribute in tour.pug template
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body')?.dataset.alert;
if (alertMessage) {
  showAlert('success', alertMessage, 20);
}
