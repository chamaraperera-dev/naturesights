/* eslint-disable @typescript-eslint/no-unused-vars */
import User from '../models/userModel';
import multer from 'multer';
import sharp from 'sharp';
import catchAsync from '../utils/catchAsync';
import { RequestHandler } from 'express';
import { Request } from 'express';
import AppError from '../utils/appError';
import * as factory from './handleFactory';
import path from 'path';

// cb callback function is similar to next function in express

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'dist/public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-userId-timestamp.jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// To store the image in memory instead of disk
const multerStorage = multer.memoryStorage();

const multerFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image ! Please upload only images.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto: RequestHandler = catchAsync(
  async (req, res, next) => {
    if (!req.file) return next();

    //No need to get the file extension as we are using sharp to convert the image to jpeg
    //Need to allocate file name to req.file.filename because we are using it in the updateMe middleware
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    console.log(__dirname);

    //Reading file from the memory
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      //Need full file path to store the image
      .toFile(
        path.join(__dirname, 'public', 'img', 'users', req.file.filename)
      );

    next();
  }
);

//Below function will accept an object and other rest parameters
// The function performs the following steps:

// It creates a new object newObj with an empty object literal {}.

// It uses the Object.keys method to get an array of all the keys in the input object obj.

// It then uses the forEach method to iterate over the array of keys and check if each key is included in the allowedFields array.

// If a key is included in allowedFields, it is added to the newObj object with the same value as in obj.

// Finally, the function returns the newObj object, which only contains the keys that were included in the allowedFields array.

// In other words, this function filters an object by allowing only the keys specified in allowedFields.

interface ObjectType {
  [key: string]: any;
}

const filterObj = (obj: ObjectType, ...allowedFields: string[]) => {
  const newObj: ObjectType = {};
  const notAllowedFields: string[] = [];
  //Object.keys(obj) will return and array containing all the key names
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    } else {
      notAllowedFields.push(el);
    }
  });
  return { allowed: newObj, notAllowed: notAllowedFields };
};

export const getAllUsers = factory.getAll(User);

// export const getAllUsers: RequestHandler = catchAsync(
//   async (req, res, next) => {
//     const users = await User.find();

//     res
//       .status(200)
//       .json({ status: 'success', results: users.length, data: { users } });
//   }
// );

export const updateMe: RequestHandler = catchAsync(async (req, res, next) => {
  //1) Create error if user POSTS password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates.Please use /updateMyPassword',
        400
      )
    );
  }

  //2) Filtered out unwanted field name that are not allowed to be updated

  const filteredBody = filterObj(req.body, 'name', 'email');
  //Adding photo to filteredBody
  if (req.file) filteredBody.allowed.photo = req.file.filename;
  const { allowed, notAllowed } = filteredBody;

  //3)Update user document

  //Here we are using findByIdAndUpdate because we don't need to update sensitive data and to user pre save middleware
  //Still we need to run validators and return updated object
  //We should not pass req.body because we need to restrict what user is allowed to update

  if (Object.keys(allowed).length === 0 && notAllowed.length > 0) {
    res.status(400).json({
      status: 'fail',
      message: `Not allowed fields found: ${notAllowed.join(', ')}`,
    });
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, allowed, {
    new: true,
    runValidators: true,
  });

  if (notAllowed.length > 0) {
    res.status(400).json({
      status: 'partial',
      message: `Unable to update these fields: ${notAllowed.join(', ')}`,
      data: { user: updatedUser },
    });
  } else {
    res.status(200).json({ status: 'success', data: { user: updatedUser } });
  }
});

//Middleware to allocate req.user.id to req.params.id
export const getMe: RequestHandler = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const deleteMe: RequestHandler = catchAsync(async (req, res, next) => {
  //We have to go to MongoDBCompass to see active:false . It is not showing up in Postman because it was set to select:false
  await User.findByIdAndUpdate(req.user.id, { active: false });

  //204 is the code for deleted
  res.status(204).json({ status: 'success', data: null });
});

export const createUser: RequestHandler = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not not defined. Please use /signup instead ',
  });
};

export const getUser = factory.getOne(User);

// export const getUser: RequestHandler = (req, res) => {
//   res
//     .status(500)
//     .json({ status: 'error', message: 'This route is not yet defined' });
// };

//Do not update password with this (findByIdAndUpdate will not use save middleware)

export const updateUser = factory.updateOne(User);

export const deleteUser = factory.deleteOne(User);
