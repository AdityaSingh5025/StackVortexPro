const User = require('../models/User');
const Profile = require("../models/Profile");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
const { convertSecondsToDuration } = require("../utils/secToDuration");


exports.updateProfile = async (req,res) =>{
    try {
        
        const {dateOfBirth="", gender, about="", contactNumber } = req.body;
        
        const userId = req.user.id

        if(!contactNumber || !gender ) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        } ``

        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;

        const updatedProfile = await Profile.findByIdAndUpdate(profileId, {dateOfBirth, gender, about, contactNumber}, {new:true});
        const updatedUserDetails = await User.findById(userId).populate("additionalDetails").exec();
        return res.status(200).json({
            success:true,
            message:'Profile updated successfully',
            updatedUserDetails
        })   
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to update profile',
            error: error.message,
        })
    }
}


exports.deleteAccount = async (req,res) =>{
    try {
        const {user} = req.body
        const userId = req.user.id

        //vallidation not neccessary but still doing
        const userDetails = await User.findById(userId);
        // if(!userDetails) {
        //     return res.status(404).json({
        //         success:false,
        //         message:'User not found',
        //     });
        // }         

        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        //TOOD: HW unenroll user form all enrolled courses
        //delete user
        await User.findByIdAndDelete({_id:userId});

        return res.status(200).json({
            success:true,
            message:'User deleted successfully',
        })   
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to delete User',
            error: error.message,
        })
    }
}

exports.getAllUserDetails = async (req, res) => {

    try {
        //get id
        const id = req.user.id;

        //validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        //return response
        return res.status(200).json({
            success:true,
            message:'User Data Fetched Successfully',
            userDetails
        });
       
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      
      let userDetails = await User.findOne({ _id: userId })
        .populate({
          path: "courses",
          populate: {
            path: "courseContent",
            populate: { path: "subSection" },
          },
        })
        .exec()

      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userId}`,
        })
      }

      userDetails = userDetails.toObject()

      // Process each enrolled course
      for (const course of userDetails.courses) {
        let totalDurationInSeconds = 0
        let totalSubsections = 0

        // Calculate total duration and count videos
        course.courseContent.forEach((section) => {
          totalDurationInSeconds += section.subSection.reduce(
            (acc, curr) => acc + parseInt(curr.timeDuration),
            0
          )
          totalSubsections += section.subSection.length
        })

        course.totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        // Get completed videos count
        const courseProgress = await CourseProgress.findOne({
          courseID: course._id,
          userId: userId,
        })

        const completedVideos = courseProgress?.completedVideos.length || 0
        
        // Calculate progress percentage
        course.progressPercentage =
          totalSubsections === 0
            ? 100
            : Math.round((completedVideos / totalSubsections) * 100 * 100) / 100
      }

      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
      
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};


exports.instructorDashboard = async(req, res) => {
	try{
		const courseDetails = await Course.find({instructor:req.user.id});

		const courseData  = courseDetails.map((course)=> {
			const totalStudentsEnrolled = course.studentsEnrolled.length
			const totalAmountGenerated = totalStudentsEnrolled * course.price

			//create an new object with the additional fields
			const courseDataWithStats = {
				_id: course._id,
				courseName: course.courseName,
				courseDescription: course.courseDescription,
				totalStudentsEnrolled,
				totalAmountGenerated,
			}
			return courseDataWithStats
		})

		res.status(200).json({courses:courseData});

	}
	catch(error) {
		console.error(error);
		res.status(500).json({message:"Internal Server Error"});
	}
}