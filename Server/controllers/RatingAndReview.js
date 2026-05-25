const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const mongoose = require("mongoose");

exports.createRating = async (req, res) => {
    try{

        //get user id
        const userId = req.user.id;
        //fetchdata from req body
        const {rating, review, courseId} = req.body;

        // #region agent log
        fetch('http://127.0.0.1:7646/ingest/ec754675-8073-46a1-b65d-24961d47e677',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11fc5a'},body:JSON.stringify({sessionId:'11fc5a',runId:'pre-fix',hypothesisId:'B,E',location:'RatingAndReview.js:createRating:entry',message:'createRating called',data:{accountType:req.user?.accountType,hasCourseId:!!courseId,hasRating:rating!=null,hasReview:!!review,userIdType:typeof userId},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        //check if user is enrolled or not
        const courseDetails = await Course.findOne(
                                    {_id:courseId,
                                    studentsEnrolled: {$elemMatch: {$eq: userId} },
                                });

        // #region agent log
        fetch('http://127.0.0.1:7646/ingest/ec754675-8073-46a1-b65d-24961d47e677',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11fc5a'},body:JSON.stringify({sessionId:'11fc5a',runId:'pre-fix',hypothesisId:'C',location:'RatingAndReview.js:createRating:enrollment',message:'enrollment check',data:{isEnrolled:!!courseDetails},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        if(!courseDetails) {
            // #region agent log
            fetch('http://127.0.0.1:7646/ingest/ec754675-8073-46a1-b65d-24961d47e677',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11fc5a'},body:JSON.stringify({sessionId:'11fc5a',runId:'pre-fix',hypothesisId:'C',location:'RatingAndReview.js:createRating:notEnrolled',message:'returning 404 not enrolled',data:{},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            return res.status(404).json({
                success:false,
                message:'Student is not enrolled in the course',
            });
        }
        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                user:userId,
                                                course:courseId,
                                            });

        // #region agent log
        fetch('http://127.0.0.1:7646/ingest/ec754675-8073-46a1-b65d-24961d47e677',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11fc5a'},body:JSON.stringify({sessionId:'11fc5a',runId:'pre-fix',hypothesisId:'A',location:'RatingAndReview.js:createRating:duplicateCheck',message:'duplicate review check',data:{alreadyReviewed:!!alreadyReviewed,existingReviewId:alreadyReviewed?String(alreadyReviewed._id):null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Please provide a rating between 1 and 5",
            });
        }

        if(alreadyReviewed) {
            const isLinkedToCourse = courseDetails.ratingAndReviews?.some(
                (reviewId) => reviewId.toString() === alreadyReviewed._id.toString()
            );

            if (!isLinkedToCourse) {
                await Course.findByIdAndUpdate(courseId, {
                    $push: { ratingAndReviews: alreadyReviewed._id },
                });
                // #region agent log
                fetch('http://127.0.0.1:7646/ingest/ec754675-8073-46a1-b65d-24961d47e677',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11fc5a'},body:JSON.stringify({sessionId:'11fc5a',runId:'post-fix',hypothesisId:'F',location:'RatingAndReview.js:createRating:repair',message:'repaired orphan review link',data:{reviewId:String(alreadyReviewed._id)},timestamp:Date.now()})}).catch(()=>{});
                // #endregion
                return res.status(200).json({
                    success: true,
                    message: "Rating and Review created Successfully",
                    ratingReview: alreadyReviewed,
                });
            }

            // #region agent log
            fetch('http://127.0.0.1:7646/ingest/ec754675-8073-46a1-b65d-24961d47e677',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11fc5a'},body:JSON.stringify({sessionId:'11fc5a',runId:'post-fix',hypothesisId:'A',location:'RatingAndReview.js:createRating:403',message:'returning 403 already reviewed and linked',data:{},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            return res.status(403).json({
                success:false,
                message:'Course is already reviewed by the user',
            });
        }

        //create rating and review
        const ratingReview = await RatingAndReview.create({
                                        rating, review, 
                                        course:courseId,
                                        user:userId,
                                    });

        // #region agent log
        fetch('http://127.0.0.1:7646/ingest/ec754675-8073-46a1-b65d-24961d47e677',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11fc5a'},body:JSON.stringify({sessionId:'11fc5a',runId:'post-fix',hypothesisId:'F',location:'RatingAndReview.js:createRating:created',message:'rating document created',data:{ratingReviewId:String(ratingReview._id)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
       
        //update course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    ratingAndReviews: ratingReview._id,
                },
            },
            { new: true }
        );

        // #region agent log
        fetch('http://127.0.0.1:7646/ingest/ec754675-8073-46a1-b65d-24961d47e677',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11fc5a'},body:JSON.stringify({sessionId:'11fc5a',runId:'post-fix',hypothesisId:'F',location:'RatingAndReview.js:createRating:courseUpdate',message:'course update after rating',data:{courseUpdateOk:!!updatedCourseDetails},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        if (!updatedCourseDetails) {
            await RatingAndReview.findByIdAndDelete(ratingReview._id);
            return res.status(500).json({
                success: false,
                message: "Failed to link review to course. Please try again.",
            });
        }

        console.log(updatedCourseDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingReview,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

exports.getAverageRating = async(req,res) => {

    try {
        const {courseId} = req.body;

        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course:courseId
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating : {$avg :rating}
                }
            }
        ])

        if (result.length>0) {
            return res.status(200).json({
                success:true,
                message:'Avg rating recived for the course',
                averageRating: result[0].averageRating
            })
        }
        return res.status(200).json({
            success:true,
            message:'Average Rating is 0, no ratings given till now',
            averageRating:0,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
    

}

exports.getAllRating = async (req, res) => {
    try{
            const allReviews = await RatingAndReview.find({})
                                    .sort({rating: "desc"})
                                    .populate({
                                        path:"user",
                                        select:"firstName lastName email image",
                                    })
                                    .populate({
                                        path:"course",
                                        select: "courseName",
                                    })
                                    .exec();
            return res.status(200).json({
                success:true,
                message:"All reviews fetched successfully",
                data:allReviews,
            });
    }   
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    } 
}