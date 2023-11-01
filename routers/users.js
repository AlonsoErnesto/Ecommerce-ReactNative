const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {User} = require('../models/UserSchema');

//GET ALL USUARIOS
router.get(`/`,async (req,res)=>{
   const userList = await User.find().select('-passwordHash');
   if(!userList) res.status(500).json({success:false});
   res.send(userList);
});

//GET ALL USUARIOS
router.get(`/:id`,async (req,res)=>{
   const user = await User.findById(req.params.id).select('-passwordHash');
   if(!user) res.status(500).json({success:false});
   res.send(user);
});

//POST USUARIO
router.post('/',async(req,res)=>{
   const {
      name,
      email,
      passwordHash,
      phone,
      isAdmin,
      street,
      apartment,
      zip,
      city,
      country,
   } = req.body;
   let user = new User({
      name,
      email,
      passwordHash:bcrypt.hashSync(passwordHash,10),
      phone,
      isAdmin,
      street,
      apartment,
      zip,
      city,
      country,
   });
   const newUser = await user.save();
   if(!newUser) return res.status(400).send("This user cannot be created!");
   res.send(newUser)
})

//LOGIN USER
router.post('/login', async (req, res) => {
   try {
      const { password, email} = req.body;
      const user = await User.findOne({ email });
      const secret = process.env.SECRET;
      if (!user) {
         res.status(400).json({ success: false, message: 'El usuario no se encontró' });
      } else {
         if(user && bcrypt.compareSync(password,user.passwordHash)){
            const token = jwt.sign(
            {
               userId : user.id,
               isAdmin : user.isAdmin
            },
               secret,{expiresIn:'1d'}
            );
            res.status(200).json({ success: true, user: user.email,token,message:'user Authenticate.'});
         } else {
            res.status(400).send('password wrong.');
         }
      }
   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }
});

//GET-COUNT User
router.get(`/get/count`,async (req,res)=>{
   try {
      const userCount = await User.countDocuments();
      if(!userCount) res.status(500).json({success:false});
      res.status(200).json({ count: userCount });
   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }
});

//DELETE User
router.delete('/:id',async (req,res)=>{
   User.findByIdAndRemove(req.params.id).then(user => {
      if(user) {
         return res.status(200).json({success:true,message:"Successfully delete the User."})
      } else {
         return res.status(404).json({success:false,message:"This User cannot be found."})
      }
   }).catch(err => {
      return res.status(500).json({success:false,error:err})
   })
});

module.exports = router;