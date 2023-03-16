"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b ||= {})
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/server.ts
var import_mongoose5 = __toESM(require("mongoose"));
var import_dotenv = __toESM(require("dotenv"));

// src/app.ts
var import_path = __toESM(require("path"));
var import_express6 = __toESM(require("express"));
var import_morgan = __toESM(require("morgan"));

// src/utils/appError.ts
var AppError = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};
var appError_default = AppError;

// src/controllers/errorController.ts
var handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new appError_default(message, 400);
};
var handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: '${value}' Please use another value`;
  return new appError_default(message, 400);
};
var handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(
    (el) => el.message
  );
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new appError_default(message, 400);
};
var handleJWTError = () => new appError_default("Invalid token. Please log in again", 401);
var handleJWTExpiredError = () => new appError_default("Your token has expired! Please log in again", 401);
var sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api"))
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  console.log("ERROR", err);
  return res.status(err.statusCode).render("error", { title: "Something went wrong!", msg: err.message });
};
var sendGenericErrorMessage = (res) => {
  return res.status(500).json({ status: "error", message: "Something went wrong" });
};
var renderErrorMessage = (res, title, message, statusCode) => {
  return res.status(statusCode).render("error", { title, msg: message });
};
var sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational)
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    console.log("ERROR", err);
    return sendGenericErrorMessage(res);
  }
  if (err.isOperational) {
    return renderErrorMessage(
      res,
      "Something went wrong!",
      err.message,
      err.statusCode
    );
  }
  console.log("ERROR", err);
  return renderErrorMessage(
    res,
    "Something went wrong!",
    "Please try again later",
    err.statusCode
  );
};
var globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = __spreadValues({}, err);
    error.message = err.message;
    if (err.name === "CastError")
      error = handleCastErrorDB(err);
    if (err.code === 11e3)
      error = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError")
      error = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError")
      error = handleJWTError();
    if (err.name === "TokenExpiredError")
      error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
var errorController_default = globalErrorHandler;

// src/app.ts
var import_express_rate_limit = __toESM(require("express-rate-limit"));
var import_helmet = __toESM(require("helmet"));
var import_express_mongo_sanitize = __toESM(require("express-mongo-sanitize"));
var import_xss_clean = __toESM(require("xss-clean"));
var import_hpp = __toESM(require("hpp"));
var import_cookie_parser = __toESM(require("cookie-parser"));

// src/routes/tourRoutes.ts
var import_express2 = __toESM(require("express"));

// src/controllers/tourController.ts
var import_multer = __toESM(require("multer"));
var import_sharp = __toESM(require("sharp"));

// src/models/tourModel.ts
var import_mongoose = __toESM(require("mongoose"));
var import_slugify = __toESM(require("slugify"));
var tourSchema = new import_mongoose.default.Schema(
  // unique is not a validator. maxlength and minlength only available for strings
  {
    name: {
      type: String,
      //required is a validator
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal than 40 characters"],
      minlength: [10, "A tour name must have more or equal than 10 characters"]
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    //not necessary write type:String
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a max group size"]
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      //User can select only easy , medium or difficult
      // enum is only for strings
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either:easy,medium,difficult "
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      //min and max will also work with dates
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be above 5.0"],
      //Setter function to run when there is a value
      set: (val) => Math.round(val * 10) / 10
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, "A tour must have a price"]
    },
    priceDiscount: {
      type: Number,
      //Callback function has access to the value that was specified (priceDiscount)
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        //{VALUE} has access to the value that was specified
        message: "Discount price ({VALUE}) should be below regular price"
      }
    },
    summary: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"]
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
        default: "Point",
        //enum means Cannot be anything else than Point
        enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    //Need to set the below fields in an array
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          //enum means Cannot be anything else than Point
          enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    //guides type should be a MongoDB Id type
    //No need to import User
    guides: [{ type: import_mongoose.default.Schema.Types.ObjectId, ref: "User" }]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });
tourSchema.virtual("durationWeeks").get(function() {
  return this.duration / 7;
});
tourSchema.virtual("reviews", {
  ref: "Review",
  //In review model we have a field called tour
  foreignField: "tour",
  localField: "_id"
});
tourSchema.pre("save", function(next) {
  this.slug = (0, import_slugify.default)(this.name, { lower: true });
  next();
});
var start = Date.now();
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt -verifyToken"
  });
  next();
});
tourSchema.pre("aggregate", function(next) {
  const aggregationExcludeSecretTour = {
    $match: { secretTour: { $ne: true } }
  };
  this.pipeline().unshift(aggregationExcludeSecretTour);
  const geoNearOpt = this.pipeline().find((el) => el.$geoNear);
  if (geoNearOpt) {
    const index = this.pipeline().findIndex((el) => el.$geoNear);
    this.pipeline().splice(index, 1);
    this.pipeline().unshift(geoNearOpt);
  }
  next();
});
tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - start} milliseconds`);
  next();
});
var Tour = import_mongoose.default.model("Tour", tourSchema);
var tourModel_default = Tour;

// src/utils/catchAsync.ts
var catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
var catchAsync_default = catchAsync;

// src/utils/apiFeatures.ts
var APIFeatures = class {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = __spreadValues({}, this.queryString);
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query.sort("-createdAt");
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query.select("-__v");
    }
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
};
var apiFeatures_default = APIFeatures;

// src/controllers/handleFactory.ts
var getAll = (Model2) => (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catchAsync_default((req, res, next) => __async(void 0, null, function* () {
    let filter = {};
    if (req.params.tourId)
      filter = { tour: req.params.tourId };
    const features = new apiFeatures_default(Model2.find(filter), req.query).filter().sort().limitFields().paginate();
    const doc = yield features.query;
    res.status(200).json({
      status: "success",
      //When sending and array it better to send the length of the array
      results: doc.length,
      data: doc
    });
  }))
);
var getOne = (Model2, popOptions) => catchAsync_default((req, res, next) => __async(void 0, null, function* () {
  let query = Model2.findById(req.params.id);
  if (popOptions)
    query = query.populate(popOptions);
  const doc = yield query;
  if (!doc) {
    return next(new appError_default("No document found with that ID ", 404));
  }
  doc.verifyToken = void 0;
  res.status(200).json({ status: "success", results: doc });
}));
var deleteOne = (Model2) => (
  //This is the inner function
  catchAsync_default((req, res, next) => __async(void 0, null, function* () {
    const doc = yield Model2.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new appError_default("No document found with that ID ", 404));
    }
    res.status(204).json({
      status: "success",
      data: null
    });
  }))
);
var updateOne = (Model2) => catchAsync_default((req, res, next) => __async(void 0, null, function* () {
  const doc = yield Model2.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  const modelName = Model2.modelName.toLowerCase();
  if (!doc) {
    return next(new appError_default("No document found with that ID ", 404));
  }
  res.status(200).json({
    status: "success",
    data: { [modelName]: doc }
  });
}));
var createOne = (Model2) => (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catchAsync_default((req, res, next) => __async(void 0, null, function* () {
    const doc = yield Model2.create(req.body);
    const modelName = Model2.modelName.toLowerCase();
    res.status(201).json({ status: "success", data: { [modelName]: doc } });
  }))
);

// src/controllers/tourController.ts
var multerStorage = import_multer.default.memoryStorage();
var multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new appError_default("Not an image ! Please upload only images.", 400), false);
  }
};
var upload = (0, import_multer.default)({ storage: multerStorage, fileFilter: multerFilter });
var uploadTourImages = upload.fields([
  {
    name: "imageCover",
    maxCount: 1
  },
  { name: "images", maxCount: 3 }
]);
var resizeTourImages = catchAsync_default(
  (req, res, next) => __async(void 0, null, function* () {
    const hasImageCover = req.files.imageCover;
    const hasImages = req.files.images;
    if (hasImageCover) {
      req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
      yield (0, import_sharp.default)(req.files.imageCover[0].buffer).resize(2e3, 1333).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`dist/public/img/tours/${req.body.imageCover}`);
    }
    if (hasImages) {
      req.body.images = [];
      yield Promise.all(
        req.files.images.map((file, i) => __async(void 0, null, function* () {
          const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
          yield (0, import_sharp.default)(file.buffer).resize(2e3, 1333).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`dist/public/img/tours/${filename}`);
          req.body.images.push(filename);
        }))
      );
    }
    next();
  })
);
var aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty,duration";
  next();
};
var getAllTours = getAll(tourModel_default);
var getTour = getOne(tourModel_default, {
  path: "reviews"
});
var createTour = createOne(tourModel_default);
var updateTour = updateOne(tourModel_default);
var deleteTour = deleteOne(tourModel_default);
var getTourStats = catchAsync_default(
  (req, res, next) => __async(void 0, null, function* () {
    const stats = yield tourModel_default.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          //Group the documents by difficulty Can also use _id:null if you don't want to group
          //$toUpper: to convert to uppercase
          numTours: { $sum: 1 },
          //For each document going through the pipeline 1 will be added to the numTours
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      },
      //Need to use field names in previous group pipeline :1 to sort ascending order
      { $sort: { avgPrice: 1 } }
      // { $match: { _id: { $ne: 'EASY' } } }, //ne -not equal to . Can repeat the stages
    ]);
    res.status(200).json({ status: "success", data: stats });
  })
);
var getMonthlyPlan = catchAsync_default(
  (req, res, next) => __async(void 0, null, function* () {
    const year = +req.params.year;
    const plan = yield tourModel_default.aggregate([
      { $unwind: "$startDates" },
      {
        $match: {
          startDates: {
            $gte: /* @__PURE__ */ new Date(`${year}-01-01`),
            $lte: /* @__PURE__ */ new Date(`${year}-12-31`)
          }
        }
      },
      //$month is a aggregation pipeline operator
      {
        $group: {
          _id: { $month: "$startDates" },
          numTourStarts: { $sum: 1 },
          tours: { $push: "$name" }
          // To get an array by pushing the name of the tour
        }
      },
      { $addFields: { month: "$_id" } },
      { $project: { _id: 0 } },
      //0 does not show the id
      { $sort: { numTourStarts: -1 } },
      //-1 is descending
      { $limit: 12 }
      //Limit results to 12
    ]);
    res.status(200).json({ status: "success", data: plan });
  })
);
var getToursWithin = catchAsync_default(
  (req, res, next) => __async(void 0, null, function* () {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");
    const radius = unit === "mi" ? +distance / 3963.2 : +distance / 6378.1;
    if (!lat || !lng) {
      next(
        new appError_default(
          "Please provide latitude and longitude in the format lat,lng",
          400
        )
      );
    }
    const tours = yield tourModel_default.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: { data: tours }
    });
  })
);
var getDistances = catchAsync_default(
  (req, res, next) => __async(void 0, null, function* () {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");
    const multiplier = unit === "mi" ? 621371e-9 : 1e-3;
    if (!lat || !lng) {
      new appError_default(
        "Please provide latitude and longitude in the format lat,lng",
        400
      );
    }
    const distances = yield tourModel_default.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            //lng first and then lat
            coordinates: [+lng, +lat]
          },
          //Distance will be shown in meters So we need to use distance multiplier property
          distanceField: "distance",
          //Same as dividing by 1000
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
    res.status(200).json({
      status: "success",
      data: { data: distances }
    });
  })
);

// src/controllers/authController.ts
var import_crypto2 = __toESM(require("crypto"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// src/models/userModel.ts
var import_crypto = __toESM(require("crypto"));
var import_mongoose2 = __toESM(require("mongoose"));
var import_validator = __toESM(require("validator"));
var import_bcryptjs = __toESM(require("bcryptjs"));
var userSchema = new import_mongoose2.default.Schema({
  name: { type: String, required: [true, "Please tell us your name"] },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [import_validator.default.isEmail, "Please provide a valid email"]
  },
  photo: { type: String, default: "default.jpg" },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user"
  },
  password: {
    type: String,
    required: [true, "Please provide your password"],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    //Custom validator returns true or false
    //This is only works on CREATE and SAVE.When we need to update an user need to use SAVE instead of findOneAndUpdate
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: "Passwords are not the same"
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  verifyToken: String,
  verified: {
    type: Boolean,
    default: false,
    select: false
  }
});
userSchema.pre("save", function(next) {
  return __async(this, null, function* () {
    if (!this.isModified("password"))
      return next();
    this.password = yield import_bcryptjs.default.hash(this.password, 12);
    this.passwordConfirm = void 0;
    next();
  });
});
userSchema.pre("save", function(next) {
  if (!this.isModified("password") || this.isNew)
    return next();
  this.passwordChangedAt = Date.now() - 1e3;
  next();
});
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = function(candidatePassword, userPassword) {
  return __async(this, null, function* () {
    return yield import_bcryptjs.default.compare(candidatePassword, userPassword);
  });
};
userSchema.methods.changesPasswordAfter = function(JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1e3;
    return JWTTimeStamp < changedTimestamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = import_crypto.default.randomBytes(32).toString("hex");
  this.passwordResetToken = import_crypto.default.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1e3;
  console.log(
    { resetToken },
    this.passwordResetToken,
    this.passwordResetExpires.toLocaleTimeString("en-US")
  );
  return resetToken;
};
userSchema.methods.verifyEmailToken = function() {
  const verifyToken = import_crypto.default.randomBytes(32).toString("hex");
  this.verifyToken = import_crypto.default.createHash("sha256").update(verifyToken).digest("hex");
  return verifyToken;
};
var User = import_mongoose2.default.model("User", userSchema);
var userModel_default = User;

// src/utils/email.ts
var import_nodemailer = __toESM(require("nodemailer"));
var import_pug = __toESM(require("pug"));
var import_html_to_text = require("html-to-text");
var Email = class {
  //new Email(user,url).sendWelcome();
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Chamara Perera <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return import_nodemailer.default.createTransport({
        service: "SendInBlue",
        auth: {
          user: process.env.SENDINBLUE_USERNAME,
          pass: process.env.SENDINBLUE_PASSWORD
        }
      });
    }
    return import_nodemailer.default.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  send(template, subject) {
    return __async(this, null, function* () {
      const html = import_pug.default.renderFile(
        `${__dirname}/views/email/${template}.pug`,
        {
          firstName: this.firstName,
          url: this.url,
          subject
        }
      );
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        //same as subject:subject
        html,
        //same as html:html
        text: (0, import_html_to_text.htmlToText)(html)
      };
      yield this.newTransport().sendMail(mailOptions);
    });
  }
  sendWelcome() {
    return __async(this, null, function* () {
      yield this.send("Welcome", "Welcome to the Nature Sights Family");
    });
  }
  sendPasswordReset() {
    return __async(this, null, function* () {
      yield this.send(
        "passwordReset",
        "Your password reset token (valid for only 10 minutes)"
      );
    });
  }
};

// src/models/reviewModel.ts
var import_mongoose3 = __toESM(require("mongoose"));
var reviewSchema = new import_mongoose3.default.Schema(
  {
    review: { type: String, required: [true, "Review cannot be empty"] },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Rating cannot be empty"]
    },
    createdAt: { type: Date, default: Date.now() },
    tour: {
      type: import_mongoose3.default.Schema.Types.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"]
    },
    user: {
      type: import_mongoose3.default.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"]
    }
  },
  //This setting should be after all the schema types
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: "user",
    select: "name photo"
  });
  next();
});
reviewSchema.statics.calcAverageRatings = function(tourId) {
  return __async(this, null, function* () {
    const stats = yield this.aggregate([
      {
        $match: { tour: tourId }
      },
      {
        $group: {
          _id: "$tour",
          nRating: { $sum: 1 },
          avgRating: { $avg: "$rating" }
        }
      }
    ]);
    console.log(stats);
    if (stats.length > 0) {
      yield tourModel_default.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
      });
    } else {
      yield tourModel_default.findByIdAndUpdate(tourId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5
      });
    }
  });
};
reviewSchema.post("save", function() {
  this.constructor.calcAverageRatings(this.tour);
});
reviewSchema.post(/^findOneAnd/, function(doc) {
  doc.constructor.calcAverageRatings(doc.tour);
});
var Review = import_mongoose3.default.model(
  "Review",
  reviewSchema
);
var reviewModel_default = Review;

// src/controllers/authController.ts
var signToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }
  return import_jsonwebtoken.default.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
var createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1e3
    ),
    //Cookie cannot be accessed or modified by the browser to prevent cross-site scripting attacks
    httpOnly: true
  };
  if (process.env.NODE_ENV === "production")
    Object.assign(cookieOptions, { secure: true });
  res.cookie("jwt", token, cookieOptions);
  user.password = void 0;
  user.verifyToken = void 0;
  res.status(statusCode).json({ status: "success", token, data: { user } });
};
var signup = catchAsync_default((req, res, next) => __async(void 0, null, function* () {
  const newUser = yield userModel_default.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    photo: req.body.photo
  });
  const url = `${req.protocol}://${req.get("host")}/me`;
  yield new Email(newUser, url).sendWelcome();
  const verifyToken = newUser.verifyEmailToken();
  yield newUser.save({ validateModifiedOnly: true });
  const confirmURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/verifyEmail/${verifyToken}`;
  const message = `Please go to this link to verify your email :${confirmURL}.
 If you didn't create an account,
  please ignore this email`;
  try {
  } catch (err) {
    newUser.verifyToken = void 0;
    yield newUser.save({ validateModifiedOnly: true });
    return next(
      new appError_default(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
  createSendToken(newUser, 201, res);
}));
var verifyEmail = catchAsync_default(
  (req, res, next) => __async(void 0, null, function* () {
    const hashedToken = import_crypto2.default.createHash("sha256").update(req.params.token).digest("hex");
    const user = yield userModel_default.findOne({
      verifyToken: hashedToken
    }).select("+verified");
    if (!user) {
      return next(new appError_default("The token is invalid or has expired", 400));
    }
    if (user.verified) {
      return next(new appError_default("Email address has already been verified", 400));
    }
    user.verified = true;
    yield user.save({ validateModifiedOnly: true });
    res.status(200).json({ status: "success", message: "Email address has been verified" });
  })
);
var login = catchAsync_default((req, res, next) => __async(void 0, null, function* () {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new appError_default("Please provide email and password", 400));
  }
  const user = yield userModel_default.findOne({ email }).select("+password");
  if (!user || !(yield user.correctPassword(password, user.password))) {
    return next(new appError_default("Incorrect email or password", 401));
  }
  createSendToken(user, 200, res);
}));
var logout = (req, res, next) => {
  res.clearCookie("jwt");
  res.status(200).json({ status: "success" });
};
var protect = catchAsync_default((req, res, next) => __async(void 0, null, function* () {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new appError_default("You are not logged in! Please log in to get access", 401)
    );
  }
  const jwtVerifyPromise = (token2, secret) => {
    return new Promise((resolve, reject) => {
      import_jsonwebtoken.default.verify(token2, secret, {}, (err, payload) => {
        if (err) {
          reject(err);
        } else {
          resolve(payload);
        }
      });
    });
  };
  const decoded = yield jwtVerifyPromise(
    token,
    process.env.JWT_SECRET
  );
  const currentUser = yield userModel_default.findById(decoded.id);
  if (!currentUser) {
    return next(
      new appError_default(
        "The user belonging to this token  does no longer exist",
        401
      )
    );
  }
  if (currentUser.changesPasswordAfter(decoded.iat)) {
    return next(
      new appError_default("User recently changed password! Please log in again", 401)
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
}));
var isLoggedIn = (req, res, next) => __async(void 0, null, function* () {
  try {
    if (req.cookies.jwt) {
      const jwtVerifyPromise = (token, secret) => {
        return new Promise((resolve, reject) => {
          import_jsonwebtoken.default.verify(token, secret, {}, (err, payload) => {
            if (err) {
              reject(err);
            } else {
              resolve(payload);
            }
          });
        });
      };
      const decoded = yield jwtVerifyPromise(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      const currentUser = yield userModel_default.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      if (currentUser.changesPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = currentUser;
      return next();
    }
    next();
  } catch (err) {
    return next();
  }
});
var restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new appError_default("You do not have permission to perform this action", 403)
        //403 is forbidden
      );
    }
    next();
  };
};
var forgotPassword = catchAsync_default(
  (req, res, next) => __async(void 0, null, function* () {
    const user = yield userModel_default.findOne({ email: req.body.email });
    if (!user) {
      return next(new appError_default("There is no user with email address", 404));
    }
    const resetToken = user.createPasswordResetToken();
    yield user.save({ validateModifiedOnly: true });
    try {
      const resetURL = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/resetPassword/${resetToken}`;
      yield new Email(user, resetURL).sendPasswordReset();
      res.status(200).json({ status: "success", message: "Token sent to email" });
    } catch (err) {
      user.passwordResetToken = void 0;
      user.passwordResetExpires = void 0;
      yield user.save({ validateModifiedOnly: true });
      return next(
        new appError_default(
          "There was an error sending the email. Try again later!",
          500
        )
      );
    }
  })
);
var resetPassword = catchAsync_default(
  (req, res, next) => __async(void 0, null, function* () {
    const hashedToken = import_crypto2.default.createHash("sha256").update(req.params.token).digest("hex");
    const user = yield userModel_default.findOne({
      passwordResetToken: hashedToken,
      //MongoDB will convert date formats to the same and compare them
      passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) {
      return next(new appError_default("The token is invalid or has expired", 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = void 0;
    user.passwordResetExpires = void 0;
    yield user.save();
    createSendToken(user, 200, res);
  })
);
var updatePassword = catchAsync_default(
  (req, res, next) => __async(void 0, null, function* () {
    const user = yield userModel_default.findById(req.user._id).select("+password");
    if (!user) {
      return next(new appError_default("The user does not exist", 400));
    }
    if (!(yield user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new appError_default("The password is wrong", 401));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    yield user.save();
    createSendToken(user, 200, res);
  })
);
var checkIfOwner = catchAsync_default(
  (req, res, next) => __async(void 0, null, function* () {
    const doc = yield reviewModel_default.findById(req.params.id);
    if (req.user.role !== "admin" && req.user.id !== (doc == null ? void 0 : doc.user.id))
      next(
        new appError_default(
          "Not Authorized. You cannot update or delete review written by someone else",
          403
        )
      );
    next();
  })
);

// src/routes/reviewRoutes.ts
var import_express = __toESM(require("express"));

// src/controllers/reviewController.ts
var getAllReviews = getAll(reviewModel_default);
var setTourUserIds = (req, res, next) => {
  if (!req.body.tour)
    req.body.tour = req.params.tourId;
  if (!req.body.user)
    req.body.user = req.user.id;
  next();
};
var getReview = getOne(reviewModel_default);
var createReview = createOne(reviewModel_default);
var updateReview = updateOne(reviewModel_default);
var deleteReview = deleteOne(reviewModel_default);

// src/routes/reviewRoutes.ts
var router = import_express.default.Router({ mergeParams: true });
router.use(protect);
router.route("/").get(getAllReviews).post(
  restrictTo("user"),
  setTourUserIds,
  createReview
);
router.route("/:id").get(getReview).patch(
  restrictTo("user", "admin"),
  checkIfOwner,
  updateReview
).delete(
  restrictTo("user", "admin"),
  checkIfOwner,
  deleteReview
);
var reviewRoutes_default = router;

// src/routes/tourRoutes.ts
var router2 = import_express2.default.Router();
router2.use("/:tourId/reviews", reviewRoutes_default);
router2.route("/tour-stats").get(getTourStats);
router2.route("/monthly-plan/:year").get(
  protect,
  restrictTo("admin", "lead-guide", "guide"),
  getMonthlyPlan
);
router2.route("/tours-within/:distance/center/:latlng/unit/:unit").get(getToursWithin);
router2.route("/distances/:latlng/unit/:unit").get(getDistances);
router2.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router2.route("/").get(getAllTours).post(
  protect,
  restrictTo("admin", "lead-guide"),
  createTour
);
router2.route("/:id").get(getTour).patch(
  protect,
  restrictTo("admin", "lead-guide"),
  uploadTourImages,
  resizeTourImages,
  updateTour
).delete(
  protect,
  restrictTo("admin", "lead-guide"),
  deleteTour
);
var tourRoutes_default = router2;

// src/routes/userRoutes.ts
var import_express3 = __toESM(require("express"));

// src/controllers/userController.ts
var import_multer2 = __toESM(require("multer"));
var import_sharp2 = __toESM(require("sharp"));
var multerStorage2 = import_multer2.default.memoryStorage();
var multerFilter2 = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new appError_default("Not an image ! Please upload only images.", 400), false);
  }
};
var upload2 = (0, import_multer2.default)({ storage: multerStorage2, fileFilter: multerFilter2 });
var uploadUserPhoto = upload2.single("photo");
var resizeUserPhoto = catchAsync_default(
  (req, res, next) => __async(void 0, null, function* () {
    if (!req.file)
      return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    yield (0, import_sharp2.default)(req.file.buffer).resize(500, 500).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`dist/public/img/users/${req.file.filename}`);
    next();
  })
);
var filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  const notAllowedFields = [];
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    } else {
      notAllowedFields.push(el);
    }
  });
  return { allowed: newObj, notAllowed: notAllowedFields };
};
var getAllUsers = getAll(userModel_default);
var updateMe = catchAsync_default((req, res, next) => __async(void 0, null, function* () {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new appError_default(
        "This route is not for password updates.Please use /updateMyPassword",
        400
      )
    );
  }
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file)
    filteredBody.allowed.photo = req.file.filename;
  const { allowed, notAllowed } = filteredBody;
  if (Object.keys(allowed).length === 0 && notAllowed.length > 0) {
    res.status(400).json({
      status: "fail",
      message: `Not allowed fields found: ${notAllowed.join(", ")}`
    });
  }
  const updatedUser = yield userModel_default.findByIdAndUpdate(req.user.id, allowed, {
    new: true,
    runValidators: true
  });
  if (notAllowed.length > 0) {
    res.status(400).json({
      status: "partial",
      message: `Unable to update these fields: ${notAllowed.join(", ")}`,
      data: { user: updatedUser }
    });
  } else {
    res.status(200).json({ status: "success", data: { user: updatedUser } });
  }
}));
var getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
var deleteMe = catchAsync_default((req, res, next) => __async(void 0, null, function* () {
  yield userModel_default.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: "success", data: null });
}));
var createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not not defined. Please use /signup instead "
  });
};
var getUser = getOne(userModel_default);
var updateUser = updateOne(userModel_default);
var deleteUser = deleteOne(userModel_default);

// src/routes/userRoutes.ts
var router3 = import_express3.default.Router();
router3.post("/signup", signup);
router3.get("/verifyEmail/:token", verifyEmail);
router3.post("/login", login);
router3.get("/logout", logout);
router3.post("/forgotPassword", forgotPassword);
router3.patch("/resetPassword/:token", resetPassword);
router3.use(protect);
router3.get("/me", getMe, getUser);
router3.patch("/updateMyPassword", updatePassword);
router3.patch(
  "/updateMe",
  uploadUserPhoto,
  resizeUserPhoto,
  updateMe
);
router3.delete("/deleteMe", deleteMe);
router3.use(restrictTo("admin"));
router3.route("/").get(getAllUsers).post(createUser);
router3.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);
var userRoutes_default = router3;

// src/routes/viewRoutes.ts
var import_express4 = __toESM(require("express"));

// src/models/bookingModel.ts
var import_mongoose4 = __toESM(require("mongoose"));
var bookingSchema = new import_mongoose4.default.Schema({
  tour: {
    type: import_mongoose4.default.Schema.Types.ObjectId,
    ref: "Tour",
    required: [true, "Booking must belong to a tour"]
  },
  user: {
    type: import_mongoose4.default.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a user"]
  },
  price: { type: Number, required: [true, "Booking must have a price"] },
  createdAt: { type: Date, default: Date.now() },
  paid: { type: Boolean, default: true }
});
bookingSchema.pre(/^find/, function(next) {
  this.populate("user").populate({ path: "tour", select: "name" });
  next();
});
var Booking = import_mongoose4.default.model("Booking", bookingSchema);
var bookingModel_default = Booking;

// src/controllers/viewsController.ts
var getOverview = catchAsync_default(
  (req, res, next) => __async(void 0, null, function* () {
    const tours = yield tourModel_default.find();
    res.status(200).render("overview", {
      title: "All tours",
      tours
    });
  })
);
var getTour2 = catchAsync_default((req, res, next) => __async(void 0, null, function* () {
  const tour = yield tourModel_default.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    select: "review rating user"
  });
  if (!tour)
    return next(new appError_default("There is no tour with that name.", 404));
  res.status(200).render("tour", {
    title: `${tour.name} tour`,
    tour
  });
}));
var getLoginForm = (req, res) => {
  res.status(200).render("login", { title: "Log into your account" });
};
var getSignUpForm = (req, res) => {
  res.status(200).render("signup", { title: "Signup" });
};
var getAccount = (req, res) => {
  res.status(200).render("account", { title: "Your account" });
};
var getMyTours = catchAsync_default((req, res, next) => __async(void 0, null, function* () {
  const bookings = yield bookingModel_default.find({ user: req.user.id });
  const tourIDs = bookings.map((el) => el.tour);
  const tours = yield tourModel_default.find({ _id: { $in: tourIDs } });
  res.status(200).render("overview", { title: "My Tours", tours });
}));

// src/controllers/bookingController.ts
var import_stripe = __toESM(require("stripe"));
var getCheckoutSession = catchAsync_default(
  (req, res, next) => __async(void 0, null, function* () {
    const stripe = new import_stripe.default(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2022-11-15"
    });
    const tour = yield tourModel_default.findById(req.params.tourId);
    if (tour) {
      const session = yield stripe.checkout.sessions.create({
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "aud",
              unit_amount: tour.price * 100,
              product_data: {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [
                  `https://www.natours.dev/img/tours/${tour.imageCover}`
                ]
              }
            }
          }
        ],
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId
      });
      res.status(200).json({ status: "success", session });
    }
  })
);
var createBookingCheckout = catchAsync_default(
  // This is only temporary because it's unsecure: everyone can make bookings without paying
  (req, res, next) => __async(void 0, null, function* () {
    const { tour, user, price } = req.query;
    if (!tour || !user || !price)
      return next();
    req.body.tour = tour;
    req.body.user = user;
    req.body.price = price;
    yield bookingModel_default.create({ tour, user, price });
    res.redirect(req.originalUrl.split("?")[0]);
  })
);
var createBooking = createOne(bookingModel_default);
var getAllBookings = getAll(bookingModel_default);
var getBooking = getOne(bookingModel_default);
var updateBooking = updateOne(bookingModel_default);
var deleteBooking = deleteOne(bookingModel_default);

// src/routes/viewRoutes.ts
var router4 = import_express4.default.Router();
router4.get(
  "/",
  createBookingCheckout,
  isLoggedIn,
  getOverview
);
router4.get("/tour/:slug", isLoggedIn, getTour2);
router4.get("/login", isLoggedIn, getLoginForm);
router4.get("/signup", getSignUpForm);
router4.get("/me", protect, getAccount);
router4.get("/my-tours", protect, getMyTours);
var viewRoutes_default = router4;

// src/routes/bookingRoutes.ts
var import_express5 = __toESM(require("express"));
var router5 = import_express5.default.Router();
router5.use(protect);
router5.get(
  "/checkout-session/:tourId",
  protect,
  getCheckoutSession
);
router5.use(restrictTo("lead-guide", "admin"));
router5.route("/").get(getAllBookings).post(createBooking);
router5.route("/:id").get(getBooking).patch(updateBooking).delete(deleteBooking);
var bookingRoutes_default = router5;

// src/app.ts
var app = (0, import_express6.default)();
app.set("view engine", "pug");
app.set("views", import_path.default.join(__dirname, "views"));
app.use(import_express6.default.static(import_path.default.join(__dirname, "public")));
app.use(import_helmet.default.crossOriginResourcePolicy({ policy: "same-origin" }));
if (process.env.NODE_ENV === "development") {
  app.use((0, import_morgan.default)("dev"));
}
var limiter = (0, import_express_rate_limit.default)({
  //100 request per hour
  max: 100,
  windowMs: 60 * 60 * 1e3,
  message: "Too many request from this IP,please try again in an hour"
});
app.use("/api", limiter);
app.use(import_express6.default.json({ limit: "10kb" }));
app.use((0, import_cookie_parser.default)());
app.use(import_express6.default.urlencoded({ extended: true, limit: "10kb" }));
app.use((0, import_express_mongo_sanitize.default)());
app.use((0, import_xss_clean.default)());
app.use(
  (0, import_hpp.default)({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price"
    ]
  })
);
app.use((req, res, next) => {
  req.RequestTime = (/* @__PURE__ */ new Date()).toISOString();
  next();
});
app.use("/", viewRoutes_default);
app.use("/api/v1/tours", tourRoutes_default);
app.use("/api/v1/users", userRoutes_default);
app.use("/api/v1/reviews", reviewRoutes_default);
app.use("/api/v1/bookings", bookingRoutes_default);
app.all("*", (req, res, next) => {
  next(new appError_default(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(errorController_default);
var app_default = app;

// src/server.ts
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  process.exit(1);
});
import_dotenv.default.config({ path: "./.env" });
var DB = "";
if (process.env.DATABASE && process.env.DATABASE_PASSWORD) {
  DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
  );
}
import_mongoose5.default.set("strictQuery", true);
import_mongoose5.default.connect(DB).then(() => {
  console.log("DB connection successful");
});
var port = process.env.PORT || 3e3;
var server = app_default.listen(port, () => console.log(`App running on ${port}...`));
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! Shutting down...");
  server.close(() => process.exit(1));
});
