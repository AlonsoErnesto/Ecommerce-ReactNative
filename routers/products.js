const mongoose = require('mongoose');
const multer = require('multer');
const express = require('express');
const router = express.Router();
const {Product} = require('../models/ProductSchema');
const {Category} = require('../models/CategorySchema');

const FILE_TYPE_MAP = {
   'image/png' : 'png',
   'image/jpeg' : 'jpeg',
   'image/jpg' : 'jpg',
}
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype];
      let uploadError = new Error('Invalid image type');
      if(isValid) {uploadError = null;}
      cb(uploadError, 'public/uploads')
   },
   filename: function (req, file, cb) {
      const fileName = file.originalname.split(' ').join('-');
      const extension = isValid
      cb(null, `${fileName}-${Date.now()}.${extension}`);
   }
});
const uploadOptions = multer({storage})

// GET Product
router.get(`/`,async (req,res)=>{
   // const productList = await Product.find().select('name image -_id');
   let filter = {};
   if(req.query.categories){
      filter = {category: req.query.categories.split(',')};
   }
   const productList = await Product.find(filter).populate('category');
   if(!productList) res.status(500).json({success:false});
   res.status(200).send(productList);
});

// GETONE Product
router.get(`/:id`,async (req,res)=>{
   const product = await Product.findById(req.params.id).populate('category'); //Name Column ID
   if(!product) res.status(500).json({success:false});
   res.status(200).send(product);
});

//POST Product
router.post(`/`,uploadOptions.single('image'),async (req,res)=>{
   const { 
      name,
      description,
      richDescription,
      image,
      brand,
      price, 
      category, 
      countInStock,
      rating,
      numReviews,
      isFeatured
   } = req.body;
   const categoryExist = await Category.findById(category);
   if(!categoryExist) return res.status(400).send('Invalid Category');
   const file = req.file;
   if(!file) return res.status(400).send('No image in the request.');
   const fileName = req.file.filename; //this parameter of storage function
   const basePath = `${req.protocol}://${req.get('host')}/public/upload`;
   const product = new Product({
      name,
      description,
      richDescription,
      image:`${basePath}${fileName}`,
      brand,
      price, 
      category, 
      countInStock,
      rating,
      numReviews,
      isFeatured
   });
   const newProduct = await product.save();
   if(!newProduct) return res.status(500).send('The product cannot be created.');
   res.send(newProduct);
});

//UPDATE Product
router.put('/:id',uploadOptions.single('image'),async(req,res)=>{
   const {   
      name,
      description,
      richDescription,
      image,
      brand,
      price, 
      category, 
      countInStock,
      rating,
      numReviews,
      isFeatured 
   } = req.body;
   if(!mongoose.isValidObjectId(req.params.id)){
      res.status(400).send('Invalid product ID');
   };
   const categoryExist = await Category.findById(category);
   if(!categoryExist) return res.status(400).send('Invalid Category');
   const product = await Product.findById(req.params.id);
   if(!product) return res.status(400).send('Invalid Product');
   const file = req.file;
   let imagePath;
   if(file) {
      const fileName = req.file.filename; //this parameter of storage function
      const basePath = `${req.protocol}://${req.get('host')}/public/upload`;
      imagePath = `${basePath}${fileName}`;
   } else {
      imagePath = product.image;
   }
   const upProduct = await Product.findByIdAndUpdate(
      req.params.id, { 
            name,
            description,
            richDescription,
            image,
            brand,
            price, 
            category, 
            countInStock,
            rating,
            numReviews,
            isFeatured 
         },{new:true}
   ); 
   if(!upProduct) return res.status(500).send('The product cannot be created.');
   res.send(upProduct);
})

//DELETE Product
router.delete('/:id',async (req,res)=>{
   Product.findByIdAndRemove(req.params.id).then(product => {
      if(product) {
         return res.status(200).json({success:true,message:"Successfully delete the product."})
      } else {
         return res.status(404).json({success:false,message:"This product cannot be found."})
      }
   }).catch(err => {
      return res.status(500).json({success:false,error:err})
   })
});

//GET-COUNT Product
router.get(`/get/count`,async (req,res)=>{
   try {
      const productCount = await Product.countDocuments();
      if(!productCount) res.status(500).json({success:false});
      res.status(200).json({ count: productCount });
   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }
});

//GET featured
router.get(`/get/featured/:count`,async (req,res)=>{
   try {
      const count = req.params.count ? req.params.count : 0;
      const products = await Product.find({isFeatured:true}).limit(+count); // Show only products with featured
      if(!products) res.status(500).json({success:false});
      res.status(200).json({ count: products });
   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }
});

router.put('/gallery-images/:id',uploadOptions.array('images',10),async(req,res)=>{
   if(!mongoose.isValidObjectId(req.params.id)){
      return res.status(400).send('Invalid Product ID.');
   };
   const files = req.files;
   let imagesPaths = [];
   const basePath = `${req.protocol}://${req.get('host')}/public/upload`;
   if(files) {
      files.map(file => {
         imagesPaths.push(`${basePath}${file.fileName}`);
      })
   }
   const upProduct = await Product.findByIdAndUpdate(
      req.params.id, { 
            images:imagesPaths
         },{new:true}
   );
   if(!upProduct) return res.status(500).send('The product cannot be created.');
   res.send(upProduct);
})

module.exports = router;