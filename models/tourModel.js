/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

//Creating Schema
const tourSchema = new mongoose.Schema(
  // unique is not a validator. maxlength and minlength only available for strings
  {
    name: {
      type: String,
      //required is a validator
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String, //not necessary write type:String
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      //User can select only easy , medium or difficult
      // enum is only for strings
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either:easy,medium,difficult ',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      //min and max will also work with dates
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be above 5.0'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      //Callback function has access to the value that was specified (priceDiscount)
      validate: {
        validator: function (val) {
          //this only points to the current doc on NEW document creation
          //Does not work when updating documents
          return val < this.price; //False will trigger a validation error
        }, //{VALUE} has access to the value that was specified
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    //Array of strings
    images: [String],
    // MongoDB will automatically convert milliseconds to current time and Execute Date.now()
    createdAt: { type: Date, default: Date.now, select: false },
    //Date Array
    startDates: [Date],
    secretTour: { type: Boolean, default: false },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//Virtual Properties
//Need to use regular function as arrow functions does not have this keyword
//.get is called a getter Virtual property is created each time we get data out of the database
//Cannot use virtual property in a database query
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create  but NOT insertMany
//Need to install slugify package to slugify names
//This is called pre save hook
tourSchema.pre('save', function (next) {
  // console.log(this); // This keyword is currently processed document
  this.slug = slugify(this.name, { lower: true });
  next();
});

/* tourSchema.pre('save', function (next) {
  console.log('Will save document...');
  next();
});

//Post middleware has the access to next and  newly created document
//Executed after executing pre middleware functions
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
}); */

//QUERY MIDDLEWARE
// this keyword will point at current query
//This will be executed before the previous query is executed
// Above code default not working for findOne query so need to write code with regular expression /^find/ (without quotes).
//  So it will executed for all the commands starting with find

// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now(); //Adding start time to Schema object
  next();
});

// tourSchema.pre('findOne', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

//This will run after the query has been executed
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  console.log(docs);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  //Because pipeline()is an array Need to use unshift to add the $match to the start of the pipeline
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline()); //It will show the pipeline
  next();
});

//Creating model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
