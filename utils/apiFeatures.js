const Tour = require('../models/tourModel');

class ApiFeatures{
  constructor(query,queryObject){
    this.query=query;
    this.queryObj=queryObject;
  }

  filter(){
    //1A) Filtering
    const queryObj1 = { ...this.queryObj };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj1[el]);
    // const tours = await Tour.find();

    //console.log(req.query, queryObj);

    //1B) Advanced Filtering
    // we are getting like{ difficulty: 'easy', duration: { gte: '5' } }
    //but we want like{ difficulty: 'easy', duration: { $gte: '5' } }

    let queryStr = JSON.stringify(queryObj1);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //console.log(JSON.parse(queryStr));

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort(){
    if(this.queryObj.sort){
      const sortBy =this.queryObj.sort.split(',').join(' ');
      this.query=this.query.sort(sortBy);
    }
    else{
      this.query=this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields(){
    if(this.queryObj.fields){
      const fields=this.queryObj.fields.split(',').join(' ');
      this.query=this.query.select(fields);
    }
    else{
      this.query=this.query.select('-__v');
    }
    return this;
  }

  paginate(){
    const page=this.queryObj.page*1 || 1;
    const limit=this.queryObj.limit*1 || 10;
    const skip=(page-1)*limit;

    this.query=this.query.skip(skip).limit(limit);
    return this;
  }


}

module.exports=ApiFeatures;