/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-unused-vars */

//To add user property to request
declare module 'express-serve-static-core' {
  interface Request {
    user: any;
  }
}

//Importing built in promisify method
// import { promisify } from 'util';
import crypto from 'crypto';
import { RequestHandler } from 'express';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { Email } from '../utils/email';
import bcrypt from 'bcryptjs';
import Review from '../models/reviewModel';

const signToken = (id: any) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret is not defined');
  }
  //id:id is the same as id
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id);

  //Need to set JWT_COOKIE_EXPIRES_IN=90 (Not 90d) because we need to convert it to milliseconds

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),

    //Cookie cannot be accessed or modified by the browser to prevent cross-site scripting attacks
    httpOnly: true,
  };

  //In Typescript set secure property in  the new object conditionally in production environment
  //Otherwise we cannot test it in development because we are not using a browser
  if (process.env.NODE_ENV === 'production')
    ///In Javascript without typescript we can write cookieOptions.secure = true;
    Object.assign(cookieOptions, { secure: true });

  res.cookie('jwt', token, cookieOptions);

  //Remove password from the output
  //we're not saving to the database after setting user.password = undefined .
  //We set it to undefined before sending the response to the client.
  user.password = undefined;
  user.verifyToken = undefined;

  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

export const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    photo: req.body.photo,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  //Send welcome is an async function so we have to await
  await new Email(newUser, url).sendWelcome();

  const verifyToken = newUser.verifyEmailToken();

  await newUser.save({ validateModifiedOnly: true });

  const confirmURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/verifyEmail/${verifyToken}`;

  const message = `Please go to this link to verify your email :${confirmURL}.\n If you didn't create an account,
  please ignore this email`;
  //Send email will return a promise .Therefore we need to await

  try {
    // await Email({
    //   email: newUser.email,
    //   subject: 'Your email confirm token',
    //   message,
    // });
  } catch (err) {
    newUser.verifyToken = undefined;
    await newUser.save({ validateModifiedOnly: true });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }

  createSendToken(newUser, 201, res);
});

export const verifyEmail: RequestHandler = catchAsync(
  async (req, res, next) => {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      verifyToken: hashedToken,
    }).select('+verified');

    if (!user) {
      return next(new AppError('The token is invalid or has expired', 400));
    }

    if (user.verified) {
      return next(new AppError('Email address has already been verified', 400));
    }

    user.verified = true;

    await user.save({ validateModifiedOnly: true });

    res
      .status(200)
      .json({ status: 'success', message: 'Email address has been verified' });
  }
);

export const login: RequestHandler = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) Check if email and password exist

  if (!email || !password) {
    //Need to return
    return next(new AppError('Please provide email and password', 400));
  }
  //2)Check if user exists && password is correct
  //Using select to add the password field which was limited by select:false in the userSchema
  const user = await User.findOne({ email }).select('+password');
  // correctPassword method available in the document because it is an instance method

  //Must use await because correctPassword is an async function .
  // Otherwise it will return a object Promise which is interpreted as boolean

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3) if everything is ok, send token to client

  createSendToken(user, 200, res);
});

export const logout: RequestHandler = (req, res, next) => {
  // res.cookie('jwt', 'loggedout', {
  //   expires: new Date(Date.now() + 10 * 1000),
  //   httpOnly: true,
  // });
  // clearing the cookie value via built-in express function
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
};

export const protect = catchAsync(async (req, res, next) => {
  //1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  //401 is for unauthorized
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }
  //2) verification token

  // Below code is not working in Typescript
  // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  const jwtVerifyPromise = (token: string, secret: string) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, {}, (err, payload) => {
        if (err) {
          reject(err);
        } else {
          resolve(payload);
        }
      });
    });
  };

  interface JwtPayload {
    id: string;
    //key should be a string but values can be any type
    [key: string]: any;
  }

  const decoded = (await jwtVerifyPromise(
    token,
    process.env.JWT_SECRET as string
  )) as JwtPayload;

  //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token  does no longer exist',
        401
      )
    );
  }

  //4)Check if user changed password after the token was issued

  if (currentUser.changesPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  //Request object travel from middleware to middleware
  //So if we want to pass data to another middleware simply put data to req object
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

//Only for rendered pages, no errors!
//For our rendered website, token is coming from cookie. No token sent through header.
//token will be sent through header only for API
export const isLoggedIn: RequestHandler = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      //1) verification of token
      const jwtVerifyPromise = (token: string, secret: string) => {
        return new Promise((resolve, reject) => {
          jwt.verify(token, secret, {}, (err, payload) => {
            if (err) {
              reject(err);
            } else {
              resolve(payload);
            }
          });
        });
      };

      interface JwtPayload {
        id: string;
        //key should be a string but values can be any type
        [key: string]: any;
      }

      const decoded = (await jwtVerifyPromise(
        req.cookies.jwt,
        process.env.JWT_SECRET as string
      )) as JwtPayload;

      //We don't need to return any errors

      //2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      //3)Check if user changed password after the token was issued

      if (currentUser.changesPasswordAfter(decoded.iat)) {
        return next();
      }
      //There is a logged in user
      //Each pug template has access to res.locals
      res.locals.user = currentUser;

      return next();
    }
    //if no cookie we directly go to next middleware
    next();
  } catch (err) {
    return next();
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    //above function has access to ..roles due to closures
    //roles will be an array ['admin','lead-guide']
    //if role='user' it does not contain in the  roles array so user does not have permission
    //In the previous protect middleware we passed current user to req.user.So we have access to currentUser
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
        //403 is forbidden
      );
    }
    next();
  };
};

export const forgotPassword: RequestHandler = catchAsync(
  async (req, res, next) => {
    // 1) Get user based on POSTed email

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with email address', 404));
    }

    //2)Generate random token

    const resetToken = user.createPasswordResetToken();
    //To save changes because previously we only modified passwordResetToken and passwordResetExpires
    // Only validating modified fields
    await user.save({ validateModifiedOnly: true });

    //3)Send it to user's email
    //We are only sending the plain token
    //Then we compare it with the encrypted token

    //Send email will return a promise .Therefore we need to await

    try {
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetPassword/${resetToken}`;
      await new Email(user, resetURL).sendPasswordReset();
      res
        .status(200)
        .json({ status: 'success', message: 'Token sent to email' });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateModifiedOnly: true });
      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          500
        )
      );
    }
  }
);

export const resetPassword: RequestHandler = catchAsync(
  async (req, res, next) => {
    //1) Get user based on token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      //MongoDB will convert date formats to the same and compare them
      passwordResetExpires: { $gt: Date.now() },
    });

    //2) If token has not expired, and there is user ,set the new password

    if (!user) {
      return next(new AppError('The token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    //We need to keep the validator before saving the user
    await user.save();

    //3) Update changedPasswordAt property for the user

    //Log the user in, sent JWT

    createSendToken(user, 200, res);
  }
);

export const updatePassword: RequestHandler = catchAsync(
  async (req, res, next) => {
    //1 Get user from collection

    //We are passing the user in the request object from the protect middleware to other middleware
    //Password is by default not sent in the req object

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return next(new AppError('The user does not exist', 400));
    }

    //2)Check if POSTed current password
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError('The password is wrong', 401));
    }

    //3)If so ,update password

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    //Save middleware in userModel.ts will hash the password and update.Set the passwordConfirm to undefined.
    //Need to use save with validation
    //Don't use findByIdAndUpdate because
    //1.passwordConfirm validation does not work because mongoose does not keep the current object in memory this.password is not defined when we update.
    //2.Pre save middleware does not work
    await user.save();

    //4)Log user in ,send JWT

    createSendToken(user, 200, res);
  }
);

export const checkIfOwner: RequestHandler = catchAsync(
  async (req, res, next) => {
    const doc = await Review.findById(req.params.id);
    if (req.user.role !== 'admin' && req.user.id !== doc?.user.id)
      next(
        new AppError(
          'Not Authorized. You cannot update or delete review written by someone else',
          403
        )
      );

    next();
  }
);
