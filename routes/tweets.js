const express = require('express');
const db = require("../db/models");
const { Tweet } = db;
const router = express.Router();
const { asyncHandler } = require('./utils.js');
const { check, validationResult } = require('express-validator');

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

const handleValidationErrors = (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      const errors = validationErrors.array().map((error) => error.msg);

      const err = Error("Bad request.");
      err.errors = errors;
      err.status = 400;
      err.title = "Bad request.";
      return next(err);
    }
    next();
  };

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



module.exports = router;
