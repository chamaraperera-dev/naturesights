class APIFeatures {
  query: any;
  queryString: any;
  constructor(query: any, queryString: any) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; //replacing {...req.query} with {...this.queryString}

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this; //Returning entire object to chain with other methods

    // let query = Tour.find(JSON.parse(queryStr));
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      //sort ('price ratingsAverage')
    } else {
      this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
      //Selecting only some fields names is called projecting
      //query=query.select('name duration price')
    } else {
      //Minus is exclusion of field __v (-__v or -price)
      this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit; //If page=3&limit=10 To go to page 3 we need to skip 20
    //page=3&limit=10     1-10 in page 1,   11-20 in page 2,    21-30 in page 3
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;
