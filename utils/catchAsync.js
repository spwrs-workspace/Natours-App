const catchAsync = (fn) => {
  return (req, res, next) => {
    // fn(req,res).catch(err=> next(err));
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
