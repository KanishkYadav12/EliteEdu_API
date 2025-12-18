// controllers/profileController.js
const mongoose = require("mongoose");
const Profile = require("../models/Profile");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body;

    const id = req.user.id;

    // Find the user
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the profile
    const profile = await Profile.findById(userDetails.additionalDetails);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Update user name fields
    if (firstName) userDetails.firstName = firstName;
    if (lastName) userDetails.lastName = lastName;
    await userDetails.save();

    // Update the profile fields
    if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
    if (about) profile.about = about;
    if (contactNumber) profile.contactNumber = contactNumber;
    if (gender) profile.gender = gender;

    await profile.save();

    // Find the updated user details
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUserDetails,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

/**
 * Delete user account
 */
exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete associated profile
    await Profile.findByIdAndDelete(user.additionalDetails);

    // Remove user from enrolled courses
    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnroled: id } },
        { new: true }
      );
    }

    // Delete course progress
    await CourseProgress.deleteMany({ userId: id });

    // Delete user
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return res.status(500).json({
      success: false,
      message: "User cannot be deleted",
      error: error.message,
    });
  }
};

/**
 * Get all user details
 */
exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;

    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
      error: error.message,
    });
  }
};

/**
 * Update display picture
 */
exports.updateDisplayPicture = async (req, res) => {
  try {
    // Validate file upload
    if (!req.files || !req.files.displayPicture) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;

    // Upload image to cloudinary
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    if (!image || !image.secure_url) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image",
      });
    }

    // Update user profile
    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { image: image.secure_url },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating display picture:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update image",
      error: error.message,
    });
  }
};

/**
 * Get enrolled courses with progress
 */
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    let userDetails = await User.findById(userId)
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec();

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: `User not found with id: ${userId}`,
      });
    }

    userDetails = userDetails.toObject();

    // Calculate progress for each course
    for (let i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0;
      let subsectionLength = 0;

      // Calculate total duration and subsection count
      for (let j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        const subSections = userDetails.courses[i].courseContent[j].subSection;

        totalDurationInSeconds += subSections.reduce(
          (acc, curr) => acc + parseInt(curr.timeDuration || 0),
          0
        );

        subsectionLength += subSections.length;
      }

      // Set total duration
      userDetails.courses[i].totalDuration = convertSecondsToDuration(
        totalDurationInSeconds
      );

      // Get course progress
      const courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      });

      const completedVideos = courseProgressCount?.completedVideos?.length || 0;

      // Calculate progress percentage
      if (subsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100;
      } else {
        const multiplier = Math.pow(10, 2);
        userDetails.courses[i].progressPercentage =
          Math.round((completedVideos / subsectionLength) * 100 * multiplier) /
          multiplier;
      }
    }

    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled courses",
      error: error.message,
    });
  }
};

/**
 * Get instructor dashboard statistics
 */
exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id });

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnroled.length;
      const totalAmountGenerated = totalStudentsEnrolled * course.price;

      return {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudentsEnrolled,
        totalAmountGenerated,
      };
    });

    return res.status(200).json({
      success: true,
      courses: courseData,
    });
  } catch (error) {
    console.error("Error fetching instructor dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor dashboard",
      error: error.message,
    });
  }
};
