const catchAsync= require('../utils/catchAsync');
const AppError= require('../utils/appError');
const ApiFeatures=require('../utils/apiFeatures');


exports.deleteOne = Model => catchAsync(async (req, res, next) => {
  const doc= await Model.findByIdAndDelete(req.params.id);

  if(!doc){
    return next(new AppError("Document not found", 404));
  }

  res.status(204).json({
    status: 'sucess',
    data: null,
  });
}
);

exports.updateOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if(!doc){
    next(new AppError("Document not found", 404));
  }

  res.status(200).json({
    status: 'sucess',
    data: {
      data: doc,
    },
  });
}
);

exports.createOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'sucess',
      data: {
        data: doc,
      },
    });
  
  
  // const newTour= new Tour({});
  // newTour.save();
  // try {
  //   const newTour = await Tour.create(req.body);

  //   res.status(201).json({
  //     status: 'sucess',
  //     data: {
  //       tour: newTour,
  //     },
  //   });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err.message,
  //   });
  // }
});

exports.getOne= (Model, popOptions)=> catchAsync(async (req, res, next) => {

  let query= Model.findById(req.params.id);
  if(popOptions) query= query.populate(popOptions);
   const doc = await query;
   
    if(!doc){
     return  next(new AppError("Document not found", 404));
    }

    res.status(200).json({
      status: 'sucess',
      data: {
        data:doc,
      },
    });
});

exports.getAll = (Model)=> catchAsync(async (req, res, next) => {
  
  // for nested routes
  let filter= {};
  if(req.params.tourId) filter={tour:req.params.tourId}


  //console.log(Tour);

  //console.log(x);
  //console.log(req.query);


    // //1A) Filtering
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((el) => delete queryObj[el]);
    // // const tours = await Tour.find();

    // console.log(req.query, queryObj);

    // //1B) Advanced Filtering
    // // we are getting like{ difficulty: 'easy', duration: { gte: '5' } }
    // //but we want like{ difficulty: 'easy', duration: { $gte: '5' } }

    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));

    // let query = Tour.find(JSON.parse(queryStr));

    //2) sorting
    //we require query.sort('price ratingsAverage') like this attributes the function

    // if(req.query.sort){
    //   const sortBy =req.query.sort.split(',').join(' ');
    //   query=query.sort(sortBy);
    // }
    // else{
    //   query=query.sort('-createdAt');
    // }

    //3) Field limiting
    // if(req.query.fields){
    //   const fields=req.query.fields.split(',').join(' ');
    //   query=query.select(fields);
    // }
    // else{
    //   query=query.select('-__v');
    // }

    // //4) Pagination
    // const page=req.query.page*1 || 1;
    // const limit=req.query.limit*1 || 10;
    // const skip=(page-1)*limit;

    // query=query.skip(skip).limit(limit);

    // if(req.query.page){
    //   const numTours=await Tour.countDocuments();
    //   if(skip>=numTours) throw new Error('This page does not exist');
    // }
    const features=new ApiFeatures(Model.find(filter),req.query).filter().sort().limitFields().paginate();
    //const docs = await features.query.explain();
    const docs = await features.query;

    //console.log(Tour.find()); it returns a query object hence we are able to chain queries
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    res.status(200).json({
      status: 'sucess',
      results: docs.length,
      data: {
        data: docs,
      },
    });
});
