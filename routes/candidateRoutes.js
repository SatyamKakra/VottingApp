const express = require('express');
const router = express.Router();

const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');
const Candidate = require('../models/candidate');

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
// post route to add a candidate
router.post('/', jwtAuthMiddleware, async  (req,res) => {
    try{
        if(!(await checkAdminRole(req.user.id)))
            return res.status(403).json({message: 'user does not have admin role'})
        
            
    const data = req.body //assuming the request body contains the candidate data
  
    // create new User documnet using the mongoose model
    const newCandidate = new Candidate(data);
  
    const response = await newCandidate.save();
    console.log('data saved');
    
    
    res.status(200).json({response: response});
  }
  catch(err){
    console.log(err);
    res.status(500).json({error: 'Internal Server Error'});
  
  }
  
  })
  

// get all candidates
// router.get('/allCandidate', jwtAuthMiddleware, async (req,res) => {
router.get('/allCandidate', async (req,res) => {
    try{
        const candidate = await Candidate.find();
        res.status(200).json(candidate);


    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'})
    }
})

//   update candidate
router.put('/:candidateId', jwtAuthMiddleware,  async (req,res) => {
    try{
        if(!(await checkAdminRole(req.user.id)))
            return res.status(403).json({message: 'user does not have admin role'})
        const candidateId = req.params.candidateId; //extract the id from the url parameter
        const updatedCandidateData = req.body; // updated data for the person
console.log("candidate id is: ",candidateId);
console.log("updatedCandidateData id is: ",updatedCandidateData);
        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true, // return the updated document
            runValidators: true // run mongoose validation
        })
        if(!response){
            return res.status(404).json({error: 'candidate not found'});
        }
        console.log('candidate data updated')
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Intrnal Server Error'})

    }
})

//   delete 
router.delete('/:candidateId', jwtAuthMiddleware,  async (req,res) => {
    try{
        if(!(await checkAdminRole(req.user.id)))
            return res.status(403).json({message: 'user does not have admin role'})
        const candidateId = req.params.candidateId; //extract the id from the url parameter

        const response = await Candidate.findByIdAndDelete(candidateId);
        if(!response){
            return res.status(404).json({error: 'candidate not found'});
        }
        console.log('candidate deleted')
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Intrnal Server Error'})

    }
})

// lets start vote
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    // no admin can vote
    // user can only vote once
    
   const candidateID = req.params.candidateID;
   const userId = req.user.id;
   console.log("candidate id is: ",candidateID);
console.log("user id is: ",userId)
    try{
        // Find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        console.log("candidate is: ",candidate);
        if(!candidate){
            console.log("candidate not found");
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if(!user){
            console.log("user not found");
            return res.status(404).json({ message: 'user not found' });
        }
        if(user.role == 'admin'){
            return res.status(403).json({ message: 'admin is not allowed'});
        }
        if(user.isVoted){
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Update the Candidate document to record the vote
        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save();

        // update the user document
        user.isVoted = true
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
});
// vote count
router.get('/voteCount', async (req,res) => {
    try{
        // find all candisate and sort them by votecount in decending order
        const candidate = await Candidate.find().sort({voteCount: 'desc'});
console.log("candi",candidate)
        // map the candidate to only return their name and vote count
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        });
console.log("record", voteRecord)
        return res.status(200).json(voteRecord);

    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Intrnal Server Error'})
    }
})




  module.exports = router;