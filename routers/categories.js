const express = require('express');
const router = express.Router();
const {Category} = require('../models/CategorySchema');

// Get All Category
router.get('/',async (req,res)=>{
   const getAllCategory = await Category.find();
   if(!getAllCategory) res.status(500).json({mesage:'No exist data Category',success:false});
   res.status(200).send(getAllCategory);
});

router.get('/:id',async (req,res)=>{
   const category = await Category.findById(req.params.id);
   if(!category){
      res.status(500).json({message:"This category with the given ID was not found"});
   }
   res.status(200).send(category);
})

// Crete Category
router.post('/', async (req, res) => {
   const { name, icon, color } = req.body;
   const newCategory = new Category({
      name,
      icon,
      color
   });

   try {
      const category = await newCategory.save();
      res.status(200).json({
         message: 'Created Category successfully',
         category: category,
         success: true
      });
   } catch (error) {
      res.status(500).json({
         message: 'Server Error',
         error,
         success: false
      });
   }
});

//Update Category
router.put('/:id',async(req,res)=>{
   const { name, icon, color } = req.body;
   const upCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {name,icon,color},
      {new:true}
   );
   if(!upCategory) return res.status(400).send("This category cannot be created!");
   res.send(upCategory)
});

// Delete Category 
router.delete(`/:id`,async(req,res)=>{
   const { id } = req.params;
   Category.findByIdAndRemove(id).then(category=>{
      if(category){
         return res.status(200).json({
            message:'This Category deleted Successfuly',
            success:true
         })
      }  else {
         return res.status(404).json({success:false,mesage:"Category not found"})
      }
   }).catch((err)=>{
      return res.status(400).json({success:false,error:err})
   })
});


module.exports = router;