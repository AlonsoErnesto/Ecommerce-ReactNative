const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
   const secret = process.env.SECRET;
   return jwt({
      secret,
      algorithms: ['HS256'],
      isRevoked
   }).unless({
      path : [
         {url:/\/uploads(.*)/,methods:['GET','OPTIONS']},
         {url:/\/products(.*)/,methods:['GET','OPTIONS']},
         {url:/\/categories(.*)/,methods:['GET','OPTIONS']},
         '/users/login',
         '/users/register'
      ]
   });
};

async function isRevoked ( req,payload, done) {
   if(!payload.isAdmin) {
      done(null,true);
   }
   done();
};

module.exports = authJwt;
