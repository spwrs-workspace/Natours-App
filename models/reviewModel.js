const mongoose= require('mongoose');
const Tour= require('./tourModel');

const reviewSchema= new mongoose.Schema({
  review:{
    type: String,
    required:[true,'A review shuld not be empty']
  },
  rating:{
    type: Number,
    min:1,
    max:5
  },
  createdAt:{
    type: Date,
    default:Date.now
  },
  tour:{
    type:mongoose.Schema.ObjectId,
    ref:'Tour',
    required:[true, 'A review must belog to tour'] 
  },
  user:{
    type:mongoose.Schema.ObjectId,
    ref:'User',
    required:[true, 'A review must belog to user'] 
  }

},
{
  toJSON:{virtuals:true},
  toObject:{virtuals: true}
});

reviewSchema.index({
  tour:1,
  user:1
},{
  unique:true
})

reviewSchema.pre(/^find/, function(next){
  // this.populate({
  //   path:'tour',
  //   select:'name'
  // }).populate({
  //   path:'user',
  //   select: 'name photo'
  // })

  this.populate({
    path:'user',
    select: 'name photo'
  })
  next();
})

reviewSchema.statics.calAverageRatings=  async function(tourId){
  const stats= await this.aggregate([
    {
      $match:{
        tour:tourId
      }
    },
     { $group:{
        _id:'$tour',
        nRatings:{$sum: 1},
        aRatings: {$avg: '$rating'}
      }
    }
  
  ])

  //console.log(stats);

  if(stats.length>0){
    
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage:stats[0].aRatings,
      ratingsQuantity:stats[0].nRatings
    })
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage:4.5,
      ratingsQuantity:0
    })
  }
}

//setting number of ratings and its average when new document created
//postsave dont has access to next and this.constructor will point to the model of document that is its constructor
reviewSchema.post('save', function(){
  this.constructor.calAverageRatings(this.tour);
})

//jonas used lengthy method in this case
//setting number of ratings and its average when document updated or deleted

// reviewSchema.pre(/^findOneAnd/, async function(next){

//   //collecting the data from db for quried docment and passing the data from pre to post middleware
//   // this.review= await this.findOne();
//   this.review= await this.model.findOne(this.getQuery())
//   next();
// })

reviewSchema.post(/^findOneAnd/, async function(doc){
  //console.log(this.review);
  await doc.constructor.calAverageRatings(doc.tour);
})


const Review= mongoose.model('Review', reviewSchema);

module.exports= Review;