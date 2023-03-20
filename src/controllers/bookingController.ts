/* eslint-disable @typescript-eslint/no-unused-vars */
import Stripe from 'stripe';
import { RequestHandler } from 'express';
import catchAsync from '../utils/catchAsync';
import Tour from '../models/tourModel';
import User from '../models/userModel';
import Booking from '../models/bookingModel';
import * as factory from './handleFactory';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
});

export const getCheckoutSession: RequestHandler = catchAsync(
  async (req, res, next) => {
    //Environment variable is not defined if we use below code outside of the function

    //1)Get the currently booked tour

    const tour = await Tour.findById(req.params.tourId);

    //2)Create checkout session

    if (tour) {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            quantity: 1,

            price_data: {
              currency: 'aud',
              unit_amount: tour.price * 100,
              product_data: {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [
                  `${req.protocol}://${req.get('host')}/img/tours/${
                    tour.imageCover
                  }`,
                ],
              },
            },
          },
        ],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/my-tours`,
        // success_url: `${req.protocol}://${req.get('host')}/?tour=${
        //   req.params.tourId
        // }&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
      });

      //3)Create session as response
      res.status(200).json({ status: 'success', session });
    }
  }
);

//No need to use below function because we are using stripe webhooks

// export const createBookingCheckout: RequestHandler = catchAsync(
//   // This is only temporary because it's unsecure: everyone can make bookings without paying
//   async (req, res, next) => {
//     //Getting the data from the query string
//     const { tour, user, price } = req.query;

//     if (!tour || !user || !price) return next();

//     req.body.tour = tour;
//     req.body.user = user;
//     req.body.price = price;

//     await Booking.create({ tour, user, price });

//     //Redirect to the original url after creating the booking and removing the query string
//     res.redirect(req.originalUrl.split('?')[0]);
//   }
// );

const createBookingCheckout = async (session: any) => {
  const tour = session.client_reference_id;
  //Getting the user id from the email
  const user = (await User.findById({ email: session.customer_email }))?.id;

  const price = session.line_items[0].price_data.unit_amount / 100;

  await Booking.create({ tour, user, price });
};

export const webhookCheckout: RequestHandler = (req, res, next) => {
  //Headers are stored as key-value pairs in a JavaScript object, and to access the value of a header you need to use bracket notation with the header name as the key
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
    //Stripe will receive the error message
  } catch (err: any) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

export const createBooking = factory.createOne(Booking);

export const getAllBookings = factory.getAll(Booking);

export const getBooking = factory.getOne(Booking);

export const updateBooking = factory.updateOne(Booking);

export const deleteBooking = factory.deleteOne(Booking);
