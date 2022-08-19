const express = require('express');
const feedcontroller = require('../controllers/feed');
const auth = require('../middleware/is_auth')
const { body } = require('express-validator');

const router = express.Router();

router.get('/posts' ,auth,feedcontroller.getPosts);

router.get('/post/:postID',auth,feedcontroller.getPostByID);

router.post('/create',[
    body("title").trim().isLength({min:5,max:40}),
    body("content").trim().isLength({min:10}).escape(),
],auth,feedcontroller.createPost);

router.put('/post/:postID',[
    body("title").trim().isLength({min:5,max:40}),
    body("content").trim().isLength({min:10}).escape(),
],auth, feedcontroller.editPost);

router.delete('/post/:postID',auth,feedcontroller.deletePost);

module.exports = router