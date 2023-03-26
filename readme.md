# Naturesights Application Documentation

Naturesights is a web application that allows users to book tours and view information about available tours. The application was built using modern technologies such as Node.js, Express, MongoDB, Mongoose, and TypeScript, with MVC Architecture implemented.
Server-side rendering implemented using Pug templates.

## Table of Contents

- [Getting Started](#getting-started)
- [Features](#features)
- [API Documentation](#api-documentation)
- [DevOps](#devops)

## Getting Started

### Environment Variables

To run the Naturesights application, you need to include a `.env` file in the root directory of the project with the following environment variables:

The following environment variables need to be set:

- `NODE_ENV`: the environment the app is running in (e.g. `production`)
- `PORT`: the port number the app should run on
- `DATABASE`: the URL of the MongoDB database
- `DATABASE_PASSWORD`: the password for the MongoDB database
- `JWT_SECRET`: the secret key for JWT authentication
- `JWT_EXPIRES_IN`: the expiration time for JWT tokens
- `JWT_COOKIE_EXPIRES_IN`: the expiration time for JWT cookies
- `EMAIL_FROM`: the email address for sending emails
- `SENDINBLUE_USERNAME`: the username for Sendinblue email service
- `SENDINBLUE_PASSWORD`: the password for Sendinblue email service
- `STRIPE_SECRET_KEY`: the secret key for Stripe payment service
- `STRIPE_WEBHOOK_SECRET`: the webhook secret for Stripe payment service

To clone the repository from Github and install the required dependencies, run the following commands:

```shell
$ git clone https://github.com/chamaraperera-dev/naturesights.git
$ cd naturesights
$ npm install
```

To compile the application using ESbuild and minify polyfilling and bundling using Parcel, run the following commands:

```shell
$ npm run build
$ npm run build:js
```

Finally, to start the application, run the following command:

```shell
$ npm run start
```

## Features

The Naturesights application comes with several features, including:

- **New user sign up**: Users can sign up for the application by providing their email address and password.
- **Confirm email Address**: Email confirmation is required before the user can log in to the application.
- **User Authentication using JWT**: JWT is used for user authentication.
- **Data validation**: Data validation is implemented to ensure that the data provided by users is valid.
- **User Authorization**: Authorization is implemented to ensure that only authorized users can access certain parts of the application.
- **Forgot password and Reset password functionality**: Users can reset their password if they forget it.
- **Delivering emails using SendInBlue and Nodemailer**: Emails are delivered to users using SendInBlue and Nodemailer.
- **User and Admin Dashboard**: Users and admins have access to their respective dashboards, where they can view their bookings and change their username and password.
- **Uploading user profile photos and Tour images using Multer**: Users can upload their profile photos and tour images using Multer.
- **Connecting to the API using Axios**: The application connects to the API using Axios.
- **Booking Tours**: Users can book tours.
- **Payment processing using Stripe webhooks**: Stripe webhooks are used for payment processing. Test credit card number 4242 4242 4242 4242 with random expiry date and cvv can be used for testing.
- **Integration of maps using Mapbox**: Maps are integrated into the application using Mapbox.
- **Separate Error handling for production and development environments using Express**: Error handling is implemented for both production and development environments using Express.

## API Documentation

The Naturesights API has several features that are listed below:

- **Geospatial queries in MongoDB**: The API can perform geospatial queries in MongoDB to find tours based on location.
- **Process Tours data using Matching and Grouping and Unwinding and Projecting in MongoDB aggregation pipeline**: The API uses the MongoDB aggregation pipeline to process tour data by performing matching, grouping, unwinding, and projecting operations.
- **Data modelling using Child and Parent Referencing and Virtual Populate**: The API uses child and parent referencing and virtual populate to model data in MongoDB.

The API documentation for the Naturesights application was created using Postman. You can find the API documentation using the [link](https://documenter.getpostman.com/view/17428274/2s93CUHAFt).

## DevOps

The Naturesights application is operational on a VPS that operates on Ubuntu, using NGINX as a reverse proxy, while Cloudflare serves as the DNS provider.
