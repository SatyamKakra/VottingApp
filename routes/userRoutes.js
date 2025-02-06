const express = require('express');
const router = express.Router();

const User = require('../models/user');
const {jwtAuthMiddleware, generateToken, checkAuthForAdmin, verifyJwtToken} = require('./../jwt');
const { json } = require('body-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
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
// router.post('/signup', jwtAuthMiddleware, checkAuthForAdmin, async (req, res) => {

//   try {
   

//     const data = req.body; // Assuming the request body contains the user data

//      // Check for duplicate Aadhaar number
//      const existingAadhaar = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
//      if (existingAadhaar) {
//        return res.status(400).json({ error: 'Aadhaar number is already registered.' });
//      }
 
//      // Check for duplicate email
//      const existingEmail = await User.findOne({ email: data.email });
//      if (existingEmail) {
//        return res.status(400).json({ error: 'Email is already registered.' });
//      }

//     // Create new user document using the mongoose model
//     const newUser = new User(data);
//     const response = await newUser.save();
//     console.log('User data saved');

//     const payload = {
//       id: response.id,
//     };
//     const token = generateToken(payload);
//     console.log('Token is:', token);

//     // send whatsapp message
//     const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

//     try {
//       await client.messages.create({
//         from: process.env.TWILIO_MOBILE_NO,
//         to: `${data.mobile}`,
//         body: `Hi ${data.name},\n\nWelcome to Our App! Your account has been successfully created.\n\nBest regards,\nSatyam Kakra`,
//       });
//       console.log('Message sent');
//     } catch (messageError) {
//       console.log('Error sending WhatsApp message:', messageError);
//       return res.status(500).json({ error: 'Error sending WhatsApp message. User registration aborted.' });
//     }

  
//     // Send welcome email
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER, 
//         pass: process.env.EMAIL_PASS, 
//       },
//     });    

//     const mailOptions = {
//       from: 'satyamkakra4u@gmail.com', 
//       to: data.email, 
//       subject: 'Welcome to Our App!',
//       text: `Hi ${data.name},\n\nYour account has been successfully created!\n\nBest regards,\nSatyam Kakra`,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Welcome email sent');



//     res.status(200).json({ response: response, token: token, message: 'User created and email sent successfully!' });
//   } catch (err) {
//     console.log('Error:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
router.post('/signup', jwtAuthMiddleware, checkAuthForAdmin, async (req, res) => {
  try {
    const data = req.body; // Assuming the request body contains the user data

    // Check for duplicate Aadhaar number
    const existingAadhaar = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
    if (existingAadhaar) {
      return res.status(400).json({ error: 'Aadhaar number is already registered.' });
    }

    // Check for duplicate email
    const existingEmail = await User.findOne({ email: data.email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // send WhatsApp message first
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    try {
      await client.messages.create({
        from: process.env.TWILIO_MOBILE_NO,
        to: `+91${data.mobile}`,
        body: `Hi ${data.name},\n\nWelcome to Our App! Your account has been successfully created.\n\nBest regards,\nSatyam Kakra`,
      });
      console.log('Welcome message sent');
    } catch (messageError) {
      console.log('Error sending WhatsApp message:', messageError);
      return res.status(500).json({ error: 'Error sending Welcome message. User registration aborted.' });
    }

    // Create and save the new user document using the mongoose model
    const newUser = new User(data);
    const response = await newUser.save();
    console.log('User data saved');

    // Generate token for the user
    const payload = { id: response.id };
    const token = generateToken(payload);
    console.log('Token is:', token);

    // Send welcome email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: 'satyamkakra4u@gmail.com',
      to: data.email,
      subject: 'Welcome to Our App!',
      text: `Hi ${data.name},\n\nYour account has been successfully created!\n\nBest regards,\nSatyam Kakra`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent');

    res.status(200).json({ response: response, token: token, message: 'User created and email sent successfully!' });
  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


  // login route
  router.post('/login', async (req, res) => {
    try {
      // Extract username and password from request body
      const { aadharCardNumber, password } = req.body;
  
      // Find the user by aadharCardNumber
      const user = await User.findOne({ aadharCardNumber });
  
      // If user does not exist or no credentials are provided, return error
      if (!user || !aadharCardNumber || !password) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
  
      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password); // Assuming passwords are hashed using bcrypt
  
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
  
      // Generate token
      const payload = {
        id: user._id,
      };
      const token = await generateToken(payload);
  
      // Return token and user data as response
      res.json({ data: user, token });
      console.log('------------- user', user);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

  // logout route token
  router.post('/logout', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Bearer

    if (!token) {
        return res.status(401).json({ error: 'Token missing. Unauthorized logout request.' });
    }

    try {
        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET); 
        
        // Invalidate the token (optional based on your implementation, e.g., a token blacklist)
        
        res.status(200).json({ message: 'Logout successful.' });
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid token. Unauthorized logout request.' });
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
      const userId = req.user.id; 
      const { currentPassword, newPassword } = req.body; 

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

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password Change',
        text: `Hi ${user.name},\n\nYour password has been changed to: ${newPassword}\n\nBest regards,\nSatyam Kakra`,
      
      };

      await transporter.sendMail(mailOptions);

      console.log('password changed successfully');
      res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// forgot password


router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    // If user does not exist, return error
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a new temporary password
    const newPassword = crypto.randomBytes(8).toString('hex'); // Generates a random 16-character password
console.log(newPassword);
    // Update the user's password in the database (store it as plain text if necessary)
    user.password = newPassword; // Storing as plain text (not recommended for production)
    await user.save();

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your Gmail App Password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Your Gmail address
      to: email,
      subject: 'Password Reset',
      text: `
Hi ${user.name},

Your new temporary password is:

${newPassword}

Please change your password immediately after logging in.

Best regards,
Satyam Kakra
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'New password sent to your email' });
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
      const voterId = req.params.voterId; 
      const updatedVoterData = req.body; 
console.log("voter id is: ",voterId);
console.log("updatedVoterData id is: ",updatedVoterData);
      const response = await User.findByIdAndUpdate(voterId, updatedVoterData, {
          new: true, 
          runValidators: true 
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