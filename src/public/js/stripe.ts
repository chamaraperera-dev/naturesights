import axios from 'axios';
import { showAlert } from './alerts';
import { loadStripe } from '@stripe/stripe-js';
export const bookTour = async (tourId: string) => {
  const stripe = await loadStripe(
    'pk_test_51MlMXPJZA7OmoHeBQHEhTV5hbZhVhu1ejrJuUL21BZqqFXTAfl5UCbJjGbIFy20gdHYpQwsLTR0Y8Q6u8sW83zWW00dIN5CVn6'
  );

  try {
    //1)Get session from the server
    // If we are using website and api in the same url then we can use relative url
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    //2)Create checkout form + charge credit card
    if (stripe)
      await stripe.redirectToCheckout({
        sessionId: session.data.session.id,
      });
  } catch (err: any) {
    console.log(err);
    showAlert('error', err);
  }
};
