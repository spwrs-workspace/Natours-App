const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User= require('./userModel');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true, //schema type options for string
    minlength:[10, 'A tour name must have more or equal than 10 characters'],
    maxlength:[40, 'A tour name must have less or equal than 40 characters'],
    //validate:[validator.isAlpha,'Tour name must only contain characters'] //custom validator
  },
  slug:String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum:{
     values: ['easy','medium','difficult'],
      message: 'Difficulty is either: easy, medium, difficult',
  }
},
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min:[1,'Rating must be above 1.0'],
    max:[5,'Rating must be below 5.0'],
    set: val => Math.round(val*10)/10
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  priceDiscount: {
    type:Number,
    validate:{
      validator:function(val){
        //this only points to current doc on NEW document creation i.e works with .create() and .save()
        return val < this.price;
      },
      message:'Discount price ({VALUE}) should be below regular price'
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select:false,
  },
  startDates: [Date],
  secretTour:{
    type:Boolean,
    default:false,
  },
  startLocation:{
    //GeoJson
    type:{
      type:String,
      defalut:"Point",
      enum:["Point"]

    },
    coordinates:[Number],
    address:String,
    description: String
  },
  locations:[
    {
      type:{
        type: String,
        default:"Point",
        enum:["Point"]
      },
      coordinates:[Number],
      description:String,
      address:String,
      day:Number
    }
  ],
  guides:[
    {
      type: mongoose.Schema.ObjectId,
      ref:'User'
    }
  ]
}
,{
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
}
);

tourSchema.index({price:1, ratingsAverage:-1});
tourSchema.index({slug:1});
tourSchema.index({startLocation: '2dsphere'});


tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual populate
tourSchema.virtual('reviews',{
  ref:'Review',
  foreignField: 'tour',
  localField:'_id'
})

//Document Middlewere: runs before .save() and .create() but not on .insertMany() OR insertOne()
//In short whenever new document is created document middleware runs

tourSchema.pre('save',function(next){
  this.slug = slugify(this.name,{lower:true});
  //console.log(this);
  next();
})

//  embedding documents
// tourSchema.pre('save', async function(next){
//   const guides= this.guides.map(async id=>await User.findById(id))
//   this.guides= await Promise.all(guides);
//   next();
// })

// tourSchema.pre('save',function(next){
//   console.log('Added slug and saving document...');
//   next();
// })

// tourSchema.post('save',function(doc,next){
//   console.log(doc);
//   next();
// });

//Query Middleware: runs before .find() and .findOne()

tourSchema.pre(/^find/,function(next){
  //console.log(this);
  this.find({secretTour:{$ne:true}});
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next){
  this.populate({
    path:'guides',
    select:'-__v -passwordChangedAt'
  })
  next();
})

// tourSchema.post(/^find/,function(docs,next){ 
//   //console.log(this);
//   console.log(`Query took ${Date.now()-this.start} milliseconds`);
//   //console.log(docs);
//   next();
// });

//Aggregation Middleware: runs before .aggregate()

// tourSchema.pre('aggregate',function(next){
//   console.log(this.pipeline());
//   this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

//console.log(mongoose.model.prototype);

module.exports = Tour;
