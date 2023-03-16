/* eslint-disable @typescript-eslint/no-unused-vars */
import Stripe from 'stripe';
import { RequestHandler } from 'express';
import catchAsync from '../utils/catchAsync';
import Tour from '../models/tourModel';
import Booking from '../models/bookingModel';
import * as factory from './handleFactory';

export const getCheckoutSession: RequestHandler = catchAsync(
  async (req, res, next) => {
    //Environment variable is not defined if we use below code outside of the function
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2022-11-15',
    });

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
                  `https://www.natours.dev/img/tours/${tour.imageCover}`,
                ],
              },
            },
          },
        ],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/?tour=${
          req.params.tourId
        }&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
      });

      //3)Create session as response
      res.status(200).json({ status: 'success', session });
    }
  }
);

export const createBookingCheckout: RequestHandler = catchAsync(
  // This is only temporary because it's unsecure: everyone can make bookings without paying
  async (req, res, next) => {
    //Getting the data from the query string
    const { tour, user, price } = req.query;

    if (!tour || !user || !price) return next();

    req.body.tour = tour;
    req.body.user = user;
    req.body.price = price;

    await Booking.create({ tour, user, price });

    //Redirect to the original url after creating the booking and removing the query string
    res.redirect(req.originalUrl.split('?')[0]);
  }
);

export const createBooking = factory.createOne(Booking);

export const getAllBookings = factory.getAll(Booking);

export const getBooking = factory.getOne(Booking);

export const updateBooking = factory.updateOne(Booking);

export const deleteBooking = factory.deleteOne(Booking);
