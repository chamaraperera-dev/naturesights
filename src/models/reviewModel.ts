import mongoose, { Model } from 'mongoose';
import Tour from './tourModel';

interface ReviewSchemaTypes {
  review: string;
  rating: number;
  createdAt: Date;
  tour: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
}

const reviewSchema = new mongoose.Schema<ReviewSchemaTypes>(
  {
    review: { type: String, required: [true, 'Review cannot be empty'] },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating cannot be empty'],
    },
    createdAt: { type: Date, default: Date.now() },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  //This setting should be after all the schema types
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//Using index options to unique to prevent duplicate reviews
//Combination of tour and user should be unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Need to populate twice

reviewSchema.pre(/^find/, function (next) {
  // In query middleware this always point to the current query
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //In static methods this will point to the current Model
  //We use aggregate method directly on the Model
  //This will return a promise
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  //Result will be an array
  // [
  //   {
  //     _id: new ObjectId("63fc72de041e1185ad0d8c55"),
  //     nRating: 3,
  //     avgRating: 4.333333333333333
  //   }
  // ]
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

interface ReviewModel extends Model<ReviewSchemaTypes> {
  calcAverageRatings: (tourId: mongoose.Types.ObjectId) => Promise<void>;
}

//Middleware run in an sequence
//Review.calcAverageRatings(this.tour)
//Unable to move above after const Review = mongoose.model('Review', reviewSchema);
// if we move it below that  reviewSchema will not contain .post middleware .Need to use post instead of save
//because in the pre save current review is not in the collection yet
//Using the type assertion for typescript

reviewSchema.post('save', function () {
  (this.constructor as ReviewModel).calcAverageRatings(this.tour);
});

//Need to change the ratings based on deleted and updated ratings
//But below methods have only access to the query middleware NOT document middleware

//findByIdAndUpdate
//findByIdAndDelete
//findByIdAndUpdate and findByIdAndDelete are equivalent to findOneAndUpdate and findOneAndDelete

reviewSchema.post(/^findOneAnd/, function (doc) {
  doc.constructor.calcAverageRatings(doc.tour);
});

const Review = mongoose.model<ReviewSchemaTypes, ReviewModel>(
  'Review',
  reviewSchema
);

export default Review;

//When submitting a new POST request
//POST /tour/234fad4/reviews
//GET /tour/234fad4/reviews
//GET /tour/234fad4/reviews/94887fda
