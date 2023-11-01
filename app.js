// Packages
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
// Routes
const categoriesRouter = require('./routers/categories.js');
const productsRouter = require('./routers/products');
const usersRouter = require('./routers/users');
const ordersRouter = require('./routers/orders');
const authJwt = require('./helpers/jwt.js');
const errorHandler = require('./helpers/error-handler.js');

// Middleware 
const api = process.env.API_URL;
require('dotenv').config();
app.use(cors());
app.options('*',cors());
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads',express.static(__dirname + '/public/uploads'));
app.use(errorHandler);


app.use(`/categories`,categoriesRouter);
app.use(`/product`,productsRouter);
app.use(`/users`,usersRouter);
app.use(`/orders`,ordersRouter);

//ConnectDB
mongoose.connect(process.env.CONNECT_DB,{
   useNewUrlParser:true,
   useUnifiedTopology:true,
   dbName:'eshop-database'
}).then(()=>{
      console.log('CONNECT DATABASE SUCCESSFULLY');
}).catch((error)=>console.log(error));


// Run server
app.listen(process.env.PORT,(res,req)=>{
   console.log(`Running on the port ${process.env.PORT}`);
})