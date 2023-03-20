/* eslint-disable prefer-arrow-callback */
import mongoose from 'mongoose';
import slugify from 'slugify';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface tourSchemaTypes {
  name: string;
  slug: string;
  price: number;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  priceDiscount: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  createdAt: Date;
  startDates: Date;
  secretTour: boolean;
  startLocation: {
    type: {
      type: string;
      default: string;
      enum: [string];
    };
    coordinates: [number];
    address: string;
    description: string;
  };
  locations: [
    {
      type: { type: string; default: string; enum: [string] };
      coordinates: [number];
      description: string;
      address: string;
      day: number;
    }
  ];
  guides: mongoose.Types.ObjectId;
}

//Creating Schema
const tourSchema = new mongoose.Schema<tourSchemaTypes>(
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
      //Setter function to run when there is a value
      set: (val: number) => Math.round(val * 10) / 10,
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
        validator: function (this: tourSchemaTypes, val: number) {
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
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        //enum means Cannot be anything else than Point
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    //Need to set the below fields in an array
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          //enum means Cannot be anything else than Point
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //guides type should be a MongoDB Id type
    //No need to import User
    guides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },

  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//Single field index
//Index by price in ascending order
// tourSchema.index({ price: 1 });

//Compound field index

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
//Need index for geoLocation  and it should be 2dsphere
tourSchema.index({ startLocation: '2dsphere' });

//Virtual Properties
//Need to use regular function as arrow functions does not have this keyword
//.get is called a getter Virtual property is created each time we get data out of the database
//Cannot use virtual property in a database query
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  //In review model we have a field called tour
  foreignField: 'tour',
  localField: '_id',
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create  but NOT insertMany
//Need to install slugify package to slugify names
//This is called pre save hook
tourSchema.pre('save', function (next) {
  // console.log(this); // This keyword is currently processed document
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Connect tours and users by embedding

/* tourSchema.pre('save', async function (next) {
  //Checking whether it is a string array for Typescript because ultimately it will return an object
  if (Array.isArray(this.guides) && typeof this.guides[0] === 'string') {
    //findById returns a query which works like a promise but if we use .exec() it will return a promise
    const guidesPromises = this.guides.map((id) => User.findById(id).exec());
    //Async await in a map function will return a promise Need to use Promise.all to get the values
    this.guides = await Promise.all(guidesPromises);
  }

  next();
}); */

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

// const start = Date.now();
// tourSchema.pre(/^find/, function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// tourSchema.pre('findOne', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  // In query middleware this always point to the current query
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -verifyToken',
  });
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (this: any, next) {
  //Because pipeline()is an array Need to use unshift to add the $match to the start of the pipeline

  const aggregationExcludeSecretTour = {
    $match: { secretTour: { $ne: true } },
  };

  this.pipeline().unshift(aggregationExcludeSecretTour);
  // console.log(this.pipeline());
  //It will show the pipeline

  const geoNearOpt = this.pipeline().find((el: any) => el.$geoNear);

  if (geoNearOpt) {
    const index = this.pipeline().findIndex((el: any) => el.$geoNear);
    this.pipeline().splice(index, 1);
    this.pipeline().unshift(geoNearOpt);
  }

  next();
});

//This will run after the query has been executed
/* tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - start} milliseconds`);
  // console.log(docs);
  next();
}); */

//Creating model
const Tour = mongoose.model<tourSchemaTypes>('Tour', tourSchema);

export default Tour;
