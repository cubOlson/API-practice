const express = require('express');
const db = require("../db/models");
const { Tweet } = db;
const router = express.Router();
const { asyncHandler, handleValidationErrors } = require('./utils.js');
const { check, validationResult } = require('express-validator');
const { requireAuth } = require("../auth");

const tweetNotFoundError = function (tweetId){
    const err = new Error('Tweet not found');
    err.status = 404;
    return err
};

const tweetValidators = [
    check('message')
        .exists({ checkFalsy: true })
        .isLength({ max: 280 })
];

router.use(requireAuth);

router.get('/', asyncHandler( async (req, res) => {
    const tweets = await Tweet.findAll()

    res.json({ tweets });
}));

router.get('/:id(\\d+)', asyncHandler( async (req, res, next) => {
    const tweetId = req.params.id;
    const tweet = await Tweet.findByPk(tweetId);
    if (tweet) {
        res.json({ tweet })
    } else {
        next(tweetNotFoundError(tweetId))
    }
}));

router.post('/', tweetValidators, handleValidationErrors, asyncHandler(
    async (req, res, next) => {
        const { message } = req.body
        const tweet = await Tweet.create({
            message
        })
        res.redirect('/tweets');
    }
));

router.put('/:id(\\d+)', tweetValidators, handleValidationErrors, asyncHandler( async (req, res, next) => {
    const tweetId = req.params.id;
    const tweet = await Tweet.findByPk(tweetId);
    if (tweet) {
        const updatedTweet = await tweet.update({
            message: req.body.message
        })
        res.json({ updatedTweet })
    } else {
        next(tweetNotFoundError(tweetId))
    }
    }
));

router.delete('/:id(\\d+)', handleValidationErrors, asyncHandler( async (req, res, next) => {
    const tweetId = req.params.id;
    const tweet = await Tweet.findByPk(tweetId);
    if (tweet) {
        await tweet.destroy();
        res.status(204).end();
    } else {
        next(tweetNotFoundError(tweetId))
    }
}));



module.exports = router;
