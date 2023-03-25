# Naturesights Application Documentation

Naturesights is a web application that allows users to book tours and view information about available tours. The application was built using modern technologies such as Node.js, Express, MongoDB, Mongoose, and TypeScript, with MVC Architecture implemented.

## Table of Contents

- [Getting Started](#getting-started)
- [Features](#features)
- [API Documentation](#api-documentation)
- [DevOps](#devops)

## Getting Started

To get started with the Naturesights application, follow these steps:

1. Clone the repository from [Github](https://github.com/chamaraperera-dev/naturesights.git).
2. Install the required dependencies using the `npm install` command.
3. Run `npm run build` to compile the application using ESbuild.
4. Run `npm run build:js` to minify polyfilling and bundling using Parcel.
5. Run `npm run start` to start the application.

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
- **Payment processing using Stripe webhooks**: Stripe webhooks are used for payment processing. Test credit card 4242 4242 4242 4242 can be used for testing.
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
