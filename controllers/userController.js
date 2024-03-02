const User = require('../models/userModel');
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

exports.uploadUserPhoto= upload.single('photo');

exports.resizeUserPhoto =catchAsync( async (req, res, next)=>{
  if(!req.file) return next();

  req.file.filename= `user-${req.user._id}-${Date.now()}.jpeg`;

 await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/users/${req.file.filename}`)  

  next();
})

const filterObj= (obj, ...allowedFields )=>{ 
  const newObj={};

  Object.keys(obj).forEach(el=>{
    if(allowedFields.includes(el)){
      newObj[el]=obj[el];
    }
  })

  return newObj;
}


exports.getAllUsers = factory.getAll(User);

exports.getMe= (req, res, next)=>{
  req.params.id= req.user.id;
  next();
}

exports.updateMe = catchAsync(async (req, res, next)=>{
  // console.log(req.file);
  // console.log(req.body);
  
  //1) create error if user posted password related data
  if(req.body.password || req.body.passwordConfirm){
    return next(new AppError('This route is not for password update. please use /updateMyPasword', 400));
  }
  
  //we cant update the user by user.save(), because some of the fields that are required we dont update hence we get validation error
  
  //2) filter the req object because we dont want to update non required things and cause problems like role:admin filed
  
  const filterdobj= filterObj(req.body, "email", "name");
  if (req.file) filterdobj.photo= req.file.filename;


  //3) update the data
  const updatedUser= await User.findByIdAndUpdate(req.user.id,
    filterdobj, {
      new: true,
      runValidators: true
    })

  res.status(200).json({
    status:'success',
    data:{
      user: updatedUser
    }
  })
})

exports.deleteMe= catchAsync( async (req, res, next)=>{

  await User.findByIdAndUpdate(req.user.id, {
    active: false
  })

  res.status(204).json({
    status:"success",
    data: null
  })
})

exports.getUser = factory.getOne(User)

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined. use /signup route',
  });
};

//admin should not update password by using this route because it will not be encrypted if done so
exports.updateUser = factory.updateOne(User)

exports.deleteUser = factory.deleteOne(User);
