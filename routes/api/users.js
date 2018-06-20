const express = require('express');

const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport =  require('passport');

const User = require('../../models/User');
const keys = require('../../config/keys');

// GET api/users/test
router.get('/test', (req, res) => res.json({msg: "Users Works"}));

//POST api/users/register
router.post('/register', (req, res) => {
    User.findOne({email : req.body.email})
    .then(user => {
        if(user) {
            return res.status(400).json({email: 'Email already exists'});
        }
        else {
            const avatar = gravatar.url(req.body.email, {
                s: '200', //Size
                r: 'pg', //Rating
                d: 'mm'  //Default
            });
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                avatar,
            })
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    newUser.password = hash;
                    newUser.save()
                    .then(user => res.json(user))
                    .catch(err => console.error(err));
                });
            });
        }
    });
});

//POST api/users/login
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email})
    .then(user => {
        if(!user) {
            return res.status(404).json({email: 'User not found'})
        }
        //Check password
        bcrypt.compare(password, user.password)
        .then(isMatch => {
            if(isMatch) {
                const payload = {id: user.id, name: user.name, avatar: user.avatar}; // Create JWT payload
                //Sign Token
                jwt.sign(payload, keys.jwtsecret, {expiresIn: 3600}, (err, token) => {
                    res.json({
                        success: true,
                        token: 'Bearer ' + token
                    });
                });
            }
            else {
                return res.status(400).json({password: 'Incorrect password'});
            }
        });
    });
});

//GET api/users/current
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
})

module.exports = router;