//const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

const catchAsync= require('../utils/catchAsync');
const AppError= require('../utils/appError');

const factory= require('./factoryHandler');

const multer= require('multer');
const sharp= require('sharp');

// const multerStorage= multer.diskStorage({
//   destination:(req, file, cb)=>{
//     cb(null,'public/img/users/');
//   },
//   filename: (req, file, cb)=>{
//     const ext= file.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   }
// })

const multerStorage= multer.memoryStorage();

const multerFilter= (req, file, cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null, true)
  } else {
    cb(new AppError('Please provide only image files', 400), false)
  }
}

const upload= multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

//single image: upload.single('photo') req.file
// multiple images with same field name: upload.array('images', 3) req.files

exports.uploadTourImages= upload.fields([
  {name:'imageCover', maxCount:1},
  {name:'images', maxCount:3},
])

exports.resizeTourImages= catchAsync(async (req, res, next)=>{
  // console.log(req.files);

  //1) process imageCover

  req.body.imageCover= `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/tours/${req.body.imageCover}`)  


  //2) process images
  req.body.images=[];

  await Promise.all(req.files.images.map(async (file, i)=>{
    const filename= `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

    await sharp(file.buffer).resize(2000, 1333).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/tours/${filename}`)  

    req.body.images.push(filename);
  }))
  next();
});


//param middleware usecase

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   if (req.params.id * 1 > tours.length - 1) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

//alias middleware usecase
exports.aliasTopTours=(req,res,next)=>{
  req.query.limit='5';
  req.query.sort='-ratingsAverage,price';
  req.query.fields='name,price,ratingsAverage,summary,difficulty';
  next();

}


exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, 'reviews');
//middleware chaining usecase

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };
exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

//agregation pipeline

exports.getTourStats= catchAsync(async (req, res, next)=>{
    const stats= await Tour.aggregate([
      {
        $match:{
          ratingsAverage:{$gte:4.5}
        }

      },
      {
        $group:{
          _id:{$toUpper:'$difficulty'},
          numTours:{ $sum:1},
          numRatings:{ $sum:'$ratingsQuantity'},
          avgRating:{ $avg:'$ratingsAverage'},
          avgPrice:{ $avg:'$price'},
          minPrice:{ $min:'$price'},
          maxPrice:{ $max:'$price'}
        }
      },
      {
        $sort:{avgPrice:1}
      },
      {
        $match:{_id:{$ne:'EASY'}}
      }
  ])
  res.status(200).json({
    status: 'sucess',
    data: {
      stats,
    },
  });
  })

exports.getMonthlyPlan= catchAsync(async (req, res, next)=>{

    const year= req.params.year*1;

    const plan= await Tour.aggregate([
      {
        $unwind:'$startDates'
      },
      {
        $match:{
          startDates:{
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group:{
          _id:{$month:'$startDates'},
          numTourStarts:{$sum:1},
          tours:{$push:'$name'}
        }
      },
      {
        $addFields:{month:'$_id'}
      },
      {
        $project:{_id:0}
      },
      {
        $sort:{numTourStarts:-1}
      },
      {
        $limit:12
      }
    ])
    res.status(200).json({
      status: 'sucess',
      data: {
        plan,
      },
    });
});

///tours-within/:distance/center/:latlng/unit/:unit
exports.getAllToursWithin= catchAsync( async (req, res, next)=>{
  const {distance, latlng, unit}= req.params;
  const [lat, lng]= latlng.split(',');
  const radius= unit==='mi'? distance/ 3963.2 : distance/6378.1

  if(!lat || !lng){
    return new AppError('provide latitude and longitude in the form lat, lng', 400);
  }

  //console.log(distance, lat, lng, unit);
  const tours= await Tour.find({
    startLocation: {$geoWithin: { $centerSphere: [ [ lng, lat ], radius ]}}}
  )

  res.status(200).json({
    status:'success',
    results: tours.length,
    data:{
      data:tours
    }
  })
})

// /distances/:latlng/unit/:unit
exports.getDistances = catchAsync( async (req, res, next)=>{
  const {latlng, unit}= req.params;
  const [lat, lng]= latlng.split(',');
  const multiplier = unit==='mi'? 0.000621371 : 0.001

  if(!lat || !lng){
    return new AppError('provide latitude and longitude in the form lat, lng', 400);
  }

  const distances = await Tour.aggregate([
    {
      $geoNear:{
        near:{
          type:'Point',
          coordinates:[lng*1, lat*1]
        },

        distanceField:'distance',
        distanceMultiplier:multiplier
      },
    },
    {
      $project:{
        name:1,
        distance:1
      }
    }
  ])

  res.status(200).json({
    status:'success',
    data:{
      distances
    }
  })

})
