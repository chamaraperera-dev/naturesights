import { Request, Response, NextFunction, RequestHandler } from 'express';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface RequestHandlerPromise {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
}

//Below function returns a promise
const catchAsync = (fn: RequestHandlerPromise): RequestHandler => {
  return (req, res, next): void => {
    // fn(req, res, next).catch((err: any) => next(err));
    //Below code is same as the above code //next function will be automatically called with the callback received
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
