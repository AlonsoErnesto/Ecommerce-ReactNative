function errrorHandler(err,req,res,next){
   if(err.name === 'UnauthorizedError'){
      // jwt authentication error
      res.status(500).json({message:"This user is not authorized."})
   };
   if(err.name === 'ValidationError'){
      // jwt authentication error
      res.status(401).json({message:err})
   };
   // default to 500 server error
   return res.status(500).json(err);
}

module.exports = errrorHandler;