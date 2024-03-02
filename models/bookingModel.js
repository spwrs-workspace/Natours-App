const mongoose= require('mongoose');

const bookingSchema= new mongoose.Schema({
  tour:{
    type: mongoose.Schema.ObjectId,
    ref:'Tour',
    required:[true, 'A Booking must be associated with the Tour']
  },
  user:{
    type: mongoose.Schema.ObjectId,
    ref:'User',
    required:[true, 'A Booking must be associated with the User']
  },
  price:{
    type: Number,
    required:[true, 'A booking must have Price']
  },
  createdAt:{
    type: Date,
    default: Date.now()
  },
  paid:{
    type: Boolean,
    default: true
  }
})

bookingSchema.pre(/^find/, function(next){
  this.populate('user').populate({
    path:'tour',
    select: 'name'
  })
  next();
})

const Booking= mongoose.model('Booking', bookingSchema);

module.exports= Booking;