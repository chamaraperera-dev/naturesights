import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { Model } from 'mongoose';
import APIFeatures from '../utils/apiFeatures';

export const getAll = (Model: Model<any>) =>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour

    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query; //features.query is the  this.query inside features instance

    // const doc = await features.query.explain()

    //SEND RESPONSE

    res.status(200).json({
      status: 'success',
      //When sending and array it better to send the length of the array
      results: doc.length,
      data: doc,
    });
  });

interface popOptionsType {
  path: string;
  select?: string;
}

export const getOne = (Model: Model<any>, popOptions?: popOptionsType) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    //Tour.findOne({_id:req.params.id}) is the same as below function
    // const tour = await Tour.findById(req.params.id).populate('guides');

    if (!doc) {
      return next(new AppError('No document found with that ID ', 404));
    }
    res.status(200).json({ status: 'success', results: doc });
  });

//This works because of javascript closures.
//Inner function will get access to variables in outer function even if outer function has already returned
export const deleteOne = (Model: Model<any>) =>
  //This is the inner function
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID ', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

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

export const updateOne = (Model: Model<any>, updateFields?: string[]) =>
  catchAsync(async (req, res, next) => {
    // Allowing only specified fields to update

    if (updateFields) {
      const filteredBody = filterObj(req.body, ...updateFields);
      const { allowed, notAllowed } = filteredBody;

      if (Object.keys(allowed).length === 0 && notAllowed.length > 0) {
        res.status(400).json({
          status: 'fail',
          message: `Not allowed fields found: ${notAllowed.join(', ')}`,
        });
      }

      const updatedDoc = await Model.findByIdAndUpdate(req.params.id, allowed, {
        new: true,
        runValidators: true,
      });

      if (notAllowed.length > 0) {
        res.status(400).json({
          status: 'partial',
          message: `Unable to update these fields: ${notAllowed.join(', ')}`,
          data: { doc: updatedDoc },
        });
      } else {
        res.status(200).json({ status: 'success', data: { user: updatedDoc } });
      }
    } else {
      //new:true will return the updated document
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      const modelName = Model.modelName.toLowerCase();

      if (!doc) {
        return next(new AppError('No document found with that ID ', 404));
      }

      res.status(200).json({
        status: 'success',
        data: { [modelName]: doc },
      });
    }
  });

export const createOne = (Model: Model<any>) =>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    const modelName = Model.modelName.toLowerCase();
    res.status(201).json({ status: 'success', data: { [modelName]: doc } });
  });
