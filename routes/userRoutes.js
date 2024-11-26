const express = require('express');
const router = express.Router();

const User = require('../models/user');
const {jwtAuthMiddleware, generateToken, checkAuthForAdmin, verifyJwtToken} = require('./../jwt');
const { json } = require('body-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const checkAdminRole = async (userId) => {
  try{
      const user = await User.findById(userId);
      if(user.role === 'admin'){
          return true;
      }

  }catch(err){
      return false;

  }
}
// post route to add a User
// router.post('/signup',jwtAuthMiddleware, checkAuthForAdmin, async (req,res) => {
//     try{
//       if (req.user.role !== 'admin') {
//         return res.status(403).json({ error: 'Forbidden: Admins only' });
//       }
//       next();
//     const data = req.body //assuming the request body contains the User data
  
//     // create new User documnet using the mongoose model
//     const newUser = new User(data);
  
//     const response = await newUser.save();
//     console.log('data saved');
    
//     const payload = {
//       id: response.id,
//     }
//     const token = generateToken(payload);
//     console.log("Token is :", token);
    
//     res.status(200).json({response: response, token: token});
//   }
//   catch(err){
//     console.log(err);
//     res.status(500).json({error: 'Internal Server Error'});
  
//   }
  
//   })


// Signup route
router.post('/signup', jwtAuthMiddleware, checkAuthForAdmin, async (req, res) => {

  try {
   

    const data = req.body; // Assuming the request body contains the user data

    // Create new user document using the mongoose model
    const newUser = new User(data);
    const response = await newUser.save();
    console.log('User data saved');

    const payload = {
      id: response.id,
    };
    const token = generateToken(payload);
    console.log('Token is:', token);

    // Send welcome email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Set this in your environment
        pass: process.env.EMAIL_PASS, // Set this in your environment
      },
    });    

    const mailOptions = {
      from: 'satyamkakra4u@gmail.com', // Replace with your email
      to: data.email, // User's email from the request body
      subject: 'Welcome to Our App!',
      text: `Hi ${data.name},\n\nYour account has been successfully created!\n\nBest regards,\nSatyam Kakra`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent');

    // send whatsapp message
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    await client.messages.create({
      from: 'whatsapp:+17433302939', // Replace with your Twilio WhatsApp-enabled number
      to: `whatsapp:${data.mobile}`, // User's phone number from the request body in international format
      body: `Hi ${data.name},\n\nWelcome to Our App! Your account has been successfully created.\n\nBest regards,\nSatyam Kakra`,
    });

    console.log('WhatsApp message sent');


    res.status(200).json({ response: response, token: token, message: 'User created and email sent successfully!' });
  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


  // login route
  router.post('/login', async(req, res) => {
    try{
    // extract username and password from request body
    const {aadharCardNumber, password} = req.body;

    // find the user by username
    const user = await User.findOne({aadharCardNumber: aadharCardNumber});
console.log("aadhar", aadharCardNumber);
console.log("password", password);

    // if user dose not exist or password dose not match, return error
    if(!aadharCardNumber || !password){
      console.log("")
      return res.status(401).json({error: 'Invalid username or password'});

    }
    // generate token
    const payload = {
      id: user._id,
    }
    const token = await generateToken(payload);

    // return token as response
    res.json({data: user,token})
    console.log('------------- user',user)
  }catch(err){
    console.log(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
  });

  // get all user
  router.get('/allVoter', async (req,res) => {
    try{
      const user = await User.find()
      res.status(200).json({user})

    }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
    }
  })

  //  profile route
  router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
      const userData = req.user;


      const userId = userData.id;
      const user = await User.findById(userId);

      res.status(200).json({user});
    }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
    }
  })

 



//   update 
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
  try {
      const userId = req.user.id; // Extract the id from the token
      const { currentPassword, newPassword } = req.body; // Extract current and new passwords from request body

      // Check if currentPassword and newPassword are present in the request body
      if (!currentPassword || !newPassword) {
          return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
      }

      // Find the user by userID
      const user = await User.findById(userId);

      // If user does not exist or password does not match, return error
      if (!user || !(await user.comparePassword(currentPassword))) {
          return res.status(401).json({ error: 'Invalid current password' });
      }

      // Update the user's password
      user.password = newPassword;
      await user.save();

      console.log('password updated');
      res.status(200).json({ message: 'Password updated' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// delete
router.delete('/:userId', jwtAuthMiddleware, async (req,res) => {
  try{
    const userId = req.params.userId;
    const response = await User.findByIdAndDelete(userId);
    if(!response){
      return res.status(404).json({error: 'User not found'});
    }
    console.log('user deleted');
    res.status(200).json({message: 'User deleted successfully'});
  }catch(err){
    console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }

})

//   update voter
router.put('/:voterId', jwtAuthMiddleware,  async (req,res) => {
  try{
      if(!(await checkAdminRole(req.user.id)))
          return res.status(403).json({message: 'user does not have admin role'})
      const voterId = req.params.voterId; //extract the id from the url parameter
      const updatedVoterData = req.body; // updated data for the person
console.log("voter id is: ",voterId);
console.log("updatedVoterData id is: ",updatedVoterData);
      const response = await User.findByIdAndUpdate(voterId, updatedVoterData, {
          new: true, // return the updated document
          runValidators: true // run mongoose validation
      })
      if(!response){
          return res.status(404).json({error: 'voter not found'});
      }
      console.log('voter data updated')
      res.status(200).json(response);
  }catch(err){
      console.log(err);
      res.status(500).json({error: 'Intrnal Server Error'})

  }
})

  module.exports = router;