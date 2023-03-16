/* eslint-disable @typescript-eslint/no-unused-vars */
// const fs = require('fs');
import multer from 'multer';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express';

import Tour from '../models/tourModel';

import AppError from '../utils/appError';
import * as factory from './handleFactory';

import catchAsync from '../utils/catchAsync';

const multerStorage = multer.memoryStorage();

const multerFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image ! Please upload only images.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export const uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  { name: 'images', maxCount: 3 },
]);

//if we have only one image
// upload.single('image');  req.file

//If we have multiple images with the same name
// upload.array('images', 5); req.files

export const resizeTourImages: RequestHandler = catchAsync(
  async (req: any, res, next) => {
    const hasImageCover = req.files.imageCover;
    const hasImages = req.files.images;

    //1)Cover Image

    //Sending imageCoverFileName to the req.body so that it can be saved in the database

    if (hasImageCover) {
      req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`dist/public/img/tours/${req.body.imageCover}`);
    }

    //2)Images

    if (hasImages) {
      req.body.images = [];
      //We cannot use async await here because we are using forEach loop
      //async await inside the callback function of the forEach loop does not wait for the async function to complete and it will move on to the next iteration
      //Since it is a async function it will return a promise and if we use map we can save an array of promises and then use Promise.all to wait for all the promises to complete

      // Since forEach() method does not wait for the completion of asynchronous code, map() method is used instead to create an array of promises and Promise.all() method is used to wait for all promises to complete before moving on to the next line of code

      await Promise.all(
        req.files.images.map(async (file: any, i: string) => {
          const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
          await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`dist/public/img/tours/${filename}`);

          req.body.images.push(filename);
        })
      );
    }

    next();
  }
);

//Alias middleware
//It will add these to the query before hitting the getAllTours handler
export const aliasTopTours: RequestHandler = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty,duration';
  next();
};

export const getAllTours = factory.getAll(Tour);

//Writing to local file system
/* const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
); */

// export const getAllTours: RequestHandler = catchAsync(
//   async (req, res, next) => {
//BUILD QUERY
// 1A) Filtering
//To create a new object
/*     const queryObj = { ...req.query };

    //Find method will return a query

    // with mongoose 6 query filter is not necessary need to add { strictQuery: true } to schema

    //1B) Advanced Filtering

    let queryStr = JSON.stringify(queryObj);
    //Using regular expression to replace gte with $gte
    // The \b before and after the string specifies a word boundary, meaning that the regular expression only matches these strings if they appear as a separate word and not as part of another word.
    The g flag at the end of the regular expression stands for "global" and allows the regular expression to match all occurrences of the pattern in the input string, not just the first one.

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));
 */
//{difficulty:'easy',duration:{$gte:5}}

/* const query = await Tour.find()
      .where('duration')f
      .equals(5)
      .where('difficulty')
      .equals('easy');
 */

/*  2)Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
      //sort ('price ratingsAverage')
    } else {
      query.sort('-createdAt');
    } */

/*   3)Field Limiting

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
      //Selecting only some fields names is called projecting
      //query=query.select('name duration price')
    } else {
      //Minus is exclusion of field __v (-__v or -price)
      query.select('-__v');
    } */

/*   4) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit; //If page=3&limit=10 To go to page 3 we need to skip 20
    //page=3&limit=10     1-10 in page 1,   11-20 in page 2,    21-30 in page 3
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    } */

//EXECUTE QUERY
//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();

//     const tours = await features.query; //features.query is the  this.query inside features instance

//     //SEND RESPONSE

//     res.status(200).json({
//       status: 'success',
//       //When sending and array it better to send the length of the array
//       results: tours.length,
//       data: tours,
//     });
//   }
// );

export const getTour = factory.getOne(Tour, {
  path: 'reviews',
});

// export const getTour: RequestHandler = catchAsync(async (req, res, next) => {
//   //Tour.findOne({_id:req.params.id}) is the same as below function
//   // const tour = await Tour.findById(req.params.id).populate('guides');
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) {
//     return next(new AppError('No tour found with that ID ', 404));
//   }
//   res.status(200).json({ status: 'success', results: tour });
// });

export const createTour = factory.createOne(Tour);

//Removing the try catch block and using the promise returned
// export const createTour: RequestHandler = catchAsync(
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   async (req: Request, res: Response, next: NextFunction) => {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({ status: 'success', data: { tour: newTour } });
//   }
// );

export const updateTour = factory.updateOne(Tour);

// export const updateTour: RequestHandler = catchAsync(async (req, res, next) => {
//   //new:true will return the updated document
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('Not tour found with that ID ', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: { tour },
//   });
// });

export const deleteTour = factory.deleteOne(Tour);

// export const deleteTour: RequestHandler = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('Not tour found with that ID ', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

export const getTourStats: RequestHandler = catchAsync(
  async (req, res, next) => {
    //Stages should be in the array
    const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: '$difficulty' }, //Group the documents by difficulty Can also use _id:null if you don't want to group
          //$toUpper: to convert to uppercase
          numTours: { $sum: 1 }, //For each document going through the pipeline 1 will be added to the numTours
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      //Need to use field names in previous group pipeline :1 to sort ascending order
      { $sort: { avgPrice: 1 } },
      // { $match: { _id: { $ne: 'EASY' } } }, //ne -not equal to . Can repeat the stages
    ]);
    res.status(200).json({ status: 'success', data: stats });
  }
);

export const getMonthlyPlan: RequestHandler = catchAsync(
  async (req, res, next) => {
    const year = +req.params.year; //2021
    //unwind will deconstruct array fields from the input document and then output one document for each element of the array
    const plan = await Tour.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      //$month is a aggregation pipeline operator
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }, // To get an array by pushing the name of the tour
        },
      },
      { $addFields: { month: '$_id' } },
      { $project: { _id: 0 } }, //0 does not show the id
      { $sort: { numTourStarts: -1 } }, //-1 is descending
      { $limit: 12 }, //Limit results to 12
    ]);
    res.status(200).json({ status: 'success', data: plan });
  }
);

// '/tours-within/:distance/center/:latlng/unit/:unit'

//  tours-within/233/center/34.052235,-118.243683/unit/mi   -This is the standard way

export const getToursWithin: RequestHandler = catchAsync(
  async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    //After splitting latlng we get an array with 2 elements
    const [lat, lng] = latlng.split(',');
    //Mongo db needs radius of the centerSphere in radiance which is distance divided by radius of the earth
    //+ operator to convert distance string to number
    const radius = unit === 'mi' ? +distance / 3963.2 : +distance / 6378.1;
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng',
          400
        )
      );
    }

    //geoWithin is a geoSpatial Operator
    //Centersphere operator will take an array of coordinates and radius
    //We need to write longitude first
    //The we need to pass in radius value
    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { data: tours },
    });
  }
);

export const getDistances: RequestHandler = catchAsync(
  async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    if (!lat || !lng) {
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      );
    }

    //There is only one single stage called geoNear
    //It should be always need to be the first stage in the pipeline
    //It requires at least one of our fields to have geoSpatial index
    // If there are multiple fields of geoSpatial indexes they we need to use keys parameter
    //Because we have only one field startLocation will be automatically used for doing calculations
    //near is the point from which to calculate the distances
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            //lng first and then lat
            coordinates: [+lng, +lat],
          },
          //Distance will be shown in meters So we need to use distance multiplier property
          distanceField: 'distance',
          //Same as dividing by 1000
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: { data: distances },
    });
  }
);
