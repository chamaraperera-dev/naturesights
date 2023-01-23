// const fs = require('fs');

const Tour = require('../models/tourModel');

const APIFeatures = require('../utils/apiFeatures');

//Alias middleware
//It will add these to the query before hitting the getAllTours handler
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//Writing to local file system
/* const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
); */

exports.getAllTours = async (req, res) => {
  try {
    //BUILD QUERY
    // 1A) Filtering
    /*     const queryObj = { ...req.query };

    //Find method will return a query

    // with mongoose 6 query filter is not necessary need to add { strictQuery: true } to schema

    //1B) Advanced Filtering

    let queryStr = JSON.stringify(queryObj);
    //Using regular expression to replace gte with $gte
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));
 */
    //{difficulty:'easy',duration:{$gte:5}}

    /* const query = await Tour.find()
      .where('duration')
      .equals(5)
      .where('difficulty')
      .equals('easy');
 */

    // 2)Sorting

    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    //   //sort ('price ratingsAverage')
    // } else {
    //   query.sort('-createdAt');
    // }

    //3)Field Limiting

    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    //   //Selecting only some fields names is called projecting
    //   //query=query.select('name duration price')
    // } else {
    //   //Minus is exclusion of field __v (-__v or -price)
    //   query.select('-__v');
    // }

    //4) Pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit; //If page=3&limit=10 To go to page 3 we need to skip 20
    // //page=3&limit=10     1-10 in page 1,   11-20 in page 2,    21-30 in page 3
    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }

    //EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    console.log(features);
    const tours = await features.query; //features.query is the  this.query inside features instance

    //SEND RESPONSE

    res.status(200).json({
      status: 'success',
      //When sending and array it better to send the length of the array
      results: tours.length,
      data: tours,
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.getTour = async (req, res) => {
  try {
    //Tour.findOne({_id:req.params.id}) is the same as below function
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({ status: 'success', results: tour });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.createTour = async (req, res) => {
  /*   const newTour = new Tour({});
  newTour.save(); */

  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (err) {
    res.status(400).json({ status: 'fail', err });
  }
};

exports.updateTour = async (req, res) => {
  try {
    //new:true will return the updated document
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; //2021
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
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};
