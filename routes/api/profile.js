const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

//Load validation
const validateProfileInput = require('../../validation/profile');

const Profile = require('../../models/Profile');
const User = require('../../models/User');


const router = express.Router();

// GET api/profile/test
router.get('/test', (req, res) => res.json({msg: "Profile Works"}));

// GET api/profile
// Get current users profile
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    Profile.findOne({user: req.user.id})
    .then(profile => {
        if(!profile) {
            errors.noProfile = 'There is no profile for the user';
            return res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// POST api/profile
// Create or edit user profile
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {

    const {errors, isValid} = validateProfileInput(req.body);
    //Check Validation
    if(!isValid) {
        //Return any errors with 400 status
        return res.status(400).json(errors);
    }

    const profileFields = {};
    const profileBasicFields = ['handle', 'company', 'bio', 'location', 'status', 'githubusername'];
    const profileSocialFields = ['youtube', 'twitter', 'linkedin', 'facebook', 'instagram'];
    
    profileBasicFields.forEach(field => {
       if(req.body[field]) {
           profileFields[field] = req.body[field];
       }
   });
   
   profileFields.social = {};
   profileSocialFields.forEach(field => {
    if(req.body[field]) {
        profileFields.social[field] = req.body[field];
    }

    Profile.findOne({user: req.user.id})
    .then(profile => {
        if(profile) {
            //Update profile
            Profile.findByIdAndUpdate({user: req.user.id}, {$set: profileFields}, {new: true})
            .then(profile => res.json(profile))
        }
        else {
            //Create profile
            //Check if handle exists
            Profile.findOne({handle: profileFields.handle})
            .then(profile => {
                if(profile) {
                    errors.handle = 'That handle already exist';
                    res.status(400).json(errors);
                }

                //Save Profile
                new Profile(profileFields).save()
                .then(profile => res.json(profile))
            })
        }
    })

})


});

module.exports = router;