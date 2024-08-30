const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.user_signup = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(user => {
            if (user) {
                return res.status(409).json({
                    message: 'The email already exists.'
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'User has been created.'
                                });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}

exports.user_login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed.'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        email: user.email,
                        userID: user._id
                    }, 'secret', {
                        expiresIn: "1h"
                    });
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    });
                }
                res.status(401).json({
                    message: 'Auth failed.'
                });
            });
        })
        .catch(err => {
            return res.status(500).json({
                error: err
            });
        });
}

exports.user_delete = (req, res, next) => {
    User.findById(req.params.userID)
        .exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: 'The user does not exist.'
                });
            }
            const userEmail = user.email;

            return User.deleteOne({ _id: req.params.userID })
                .exec()
                .then(result => {
                    res.status(200).json({
                        message: `The user with the email: ${userEmail} has been deleted.`
                    });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
} 