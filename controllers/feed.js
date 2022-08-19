const {validationResult} = require('express-validator/check')
const { default: mongoose } = require('mongoose')
const Post = require('../models/Post');
const User = require('../models/User');

// Getting All Posts
exports.getPosts = (req,res,next)=>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new Error("Validation Error");
        error.statusCode = 422;
        throw error;
    }
    Post.find()
    .then(posts=>{
        if(!posts){
            const err = new Error("No Post Found");
            err.statusCode = 404;
            throw(err)
        }
        res.status(200).json(
            {
                message: "Posts are available.",
                posts : posts
            }
        )
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err);
    })  
}

// Getting a Single Post
exports.getPostByID = (req,res,next)=>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new Error("Validation Error");
        error.statusCode = 422;
        throw error;
    }
    const postID = req.params.postID;
    Post.findById(postID)
        .then(post=>{
            if(!post){
                const err = new Error("No Post Found");
                err.statusCode = 404;
                throw(err)
            }
            res.status(200).json(
                {
                    message: "Post Found",
                    post : post
                }
            )
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode = 500
            }
            next(err);
        })
}

// Create a Post
exports.createPost =(req,res,next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new Error("Validation Error");
        error.statusCode = 422;
        throw error;
    }
    else{
        const title = req.body.title;
        const content = req.body.content;
        const user_id = req.user_id;
        const imageURL = req.body.imageURL;

        let creator;
        const post = new Post({
            title : title,
            content : content,
            imageURL : imageURL,
            creator : user_id
        })

        post
            .save()
            .then(result=>{
                return User.findById(user_id);
            })
            .then(user =>{
                creator = user
                user.posts.push(post);
                return user.save();
            })
            .then(result=>{
                res.status(201).json({
                    message : "feed created...",
                    post : post,
                    user: creator
                })
            })
            .catch(err=>{
                if(!err.statusCode){
                    err.statusCode = 500;
                }
                next(err);
            })
    }
}

// Edit a post
exports.editPost = (req,res,next)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error("Validation Error");
        error.statusCode = 422;
        throw error;
    }
    const postID = req.params.postID;
    const title = req.body.title;
    const content = req.body.content;
    const imageURL = req.body.imageURL;

    Post.findById(postID)
        .then(post=>{
            if(!post){
                const err = new Error("No Post Found");
                err.statusCode = 404;
                throw(err);
            }
            if(!post.creator.toString === req.user_id){
                const error = new Error("User not allowed to delete that post.");
                error.statusCode = 403;
                throw error;
            }
            console.log(post),
            console.log(title,content)
            post.title = title;
            post.content = content;
            post.imageUrl = imageURL;
            return post.save();
        })
        .then(result=>{
            res.status(201).json({
                message : "feed editted",
                post : result
            })
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })


}

// Deleting a post
exports.deletePost = (req,res,next)=>{
    const id = req.params.postID;
    Post.findById(id)
        .then(post=>{
            if(!post){
                const err = new Error("Post Not Found for deleting");
                err.statusCode = 404;
                throw err;
            }
            if(!post.creator.toString === req.user_id){
                const error = new Error("User not allowed to delete that post.");
                error.statusCode = 403;
                throw error;
            }
            Post.findByIdAndRemove(id)
            .then(result=>{
                return User.findById(req.user_id)
            })
            .then(user=>{
                user.posts.pull(id);
                return user.save();
            })
            .then(result=>{
                res.status(200).json(
                    {
                        message:"Successfully removed Post",
                    }
                )
            })
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })
}