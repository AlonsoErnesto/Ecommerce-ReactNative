const express = require('express');
const router = express.Router();
const {Orders} = require('../models/OrderSchema');
const {OrderItem} = require('../models/OrderItemSchema');

router.get(`/`,async (req,res)=>{
   const orderList = await Orders.find().populate('user','name').sort({'dateOrdered':-1});
   if(!orderList) res.status(500).json({success:false});
   res.send(orderList);
});

router.get(`/:id`,async (req,res)=>{
   const order = await Orders.findById(req.params.id)
   .populate('user','name')
   .populate({path:'orderItems',populate:{path:'product',populate:'category'}});
   if(!order) res.status(500).json({success:false});
   res.send(order);
});

// Crete Order
router.post('/', async (req, res) => {
   const { 
      orderItems,
      shippingAddress1,
      shippingAddress2,
      city,
      zip,
      country,
      phone,
      status,
      totalPrice,
      user
   } = req.body;
   const orderItemsIds = Promise.all(orderItems.map(async(orderItem) => {
      let newOrderItem = new OrderItem({
         quantity : orderItem.quantity,
         product : orderItem.product
      });
      const OrderItemSave = await newOrderItem.save();
      return OrderItemSave._id;
   }));
   const orderitemsIdsResolved = await orderItemsIds;
   const totalPrices = await Promise.all(orderitemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate('product','price');
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
   }));
   const totalPriceResponse = totalPrices.reduce((a,b)=>a+b,0);
   let order = new Orders({
      orderItems:orderitemsIdsResolved,
      shippingAddress1,
      shippingAddress2,
      city,
      zip,
      country,
      phone,
      status,
      totalPrice:totalPriceResponse,
      user
   });
   try {
      const newOrder = await order.save();
      res.status(200).json({
         message: 'Created Category successfully',
         order: newOrder,
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

//Update Order
router.put('/:id',async(req,res)=>{
   const { status } = req.body;
   const order = await Orders.findByIdAndUpdate(
      req.params.id,
      {status},
      {new:true}
   );
   if(!order) return res.status(400).send("This order cannot be updated!");
   res.send(order)
});

// Delete Order 
router.delete(`/:id`,async(req,res)=>{
   const { id } = req.params;
   Orders.findByIdAndRemove(id).then(async order=>{
      if(order){
         await order.orderItems.map(async orderItem => {
            await OrderItem.findByIdAndRemove(orderItem);
         });
         return res.status(200).json({
            message:'This order deleted Successfuly',
            success:true
         })
      }  else {
         return res.status(404).json({success:false,mesage:"order not found"})
      }
   }).catch((err)=>{
      return res.status(400).json({success:false,error:err})
   })
});

router.get('/get/totalsales',async(req,res)=>{
   const totalSales = await Orders.aggregate([
      { $group : {_id : null , totalsales : { $sum : '$totalPrice'}}}
   ]);
   if(!totalSales) return res.status(400).send('The order sales cannot be generated');
   res.send({totalSales:totalSales.pop().totalsales});
});

//GET-COUNT Orders
router.get(`/get/count`,async (req,res)=>{
   try {
      const ordersCount = await Orders.countDocuments((count)=>count);
      if(!ordersCount) res.status(500).json({success:false});
      res.status(200).json({ count: ordersCount });
   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }
});

//GET-COUNT Orders
router.get(`/get/userorders/:userId`,async (req,res)=>{
   const userOrderList = await Orders.find({user:req.params.user})
   .populate({path:'orderItems',populate:{path:'product',populate:'category'}})
   .sort({'dateOrdered':-1});
   if(!userOrderList) res.status(500).json({success:false});
   res.send(userOrderList);
});

module.exports = router;