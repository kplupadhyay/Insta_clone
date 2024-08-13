import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(401).json({
        message: "please enter all the required field",
        sucess: "false",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "User already exist with this email account",
        sucess: "false",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });
    return res
      .status(200)
      .json({ message: "Account Created Sucessfully", sucess: "true" });
  } catch (e) {
    console.log(e);
  }
};

export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password) {
      res.status(401).json({
        message: "please enter all the required field",
        sucess: "false",
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "User doenot exist", sucess: "false" });
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      return res.status(401).json({
        message: "Invalid Login",
        sucess: "true",
      });
    }
    const token = await jwt.sign({ userId: user._id }, process.env.SECRET, {
      expiresIn: "1d",
    });
    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      //   posts: populatedPosts,
    };
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user,
      });
  } catch (e) {
    console.log(e);
  }
};
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if all required fields are provided
//     if (!email || !password) {
//       return res.status(400).json({
//         message: "Please enter all the required fields",
//         success: false,
//       });
//     }

//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({
//         message: "User does not exist",
//         success: false,
//       });
//     }

//     // Compare passwords
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(400).json({
//         message: "Invalid password",
//         success: false,
//       });
//     }

//     // Create a JWT token
//     const token = jwt.sign({ userId: user._id }, process.env.SECRET, {
//       expiresIn: "1d",
//     });

//     // Populate user profile (if applicable)
//     const populatedUser = {
//       _id: user._id,
//       username: user.username,
//       email: user.email,
//       profilePicture: user.profilePicture,
//       bio: user.bio,
//       followers: user.followers,
//       following: user.following,
//       // Ensure populatedPosts is correctly handled or populated here
//     };

//     // Send response with cookie
//     return res
//       .cookie("token", token, {
//         httpOnly: true,
//         sameSite: "strict",
//         maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
//       })
//       .json({
//         message: `Welcome back ${user.username}`,
//         success: true,
//         user: populatedUser,
//       });
//   } catch (error) {
//     console.error(error); // Log the error for debugging
//     return res.status(500).json({
//       message: "Internal server error",
//       success: false,
//     });
//   }
// };
export const logout = async (_, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId).select("-password");
    return res.status(200).json({ user, success: "true" });
  } catch (e) {
    console.log(e);
  }
};

// export const editProfile = async (req, res) => {
//   try {
//     const userId = req.id;
//     const { bio, gender } = req.body;
//     const profilePicture = req.file;
//     let cloudResponse;
//     if (profilePicture) {
//       const fileUri = getDataUri(profilePicture);
//       cloudResponse = await cloudinary.uploader.upload(fileUri);
//     }
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//         success: false,
//       });
//     }
//     if (bio) user.bio = bio;
//     if (gender) user.gender = gender;
//     if (profilePicture) user.profilePicture = cloudResponse.secure_url;

//     await user.save();

//     return res.status(200).json({
//       message: "Profile Updated",
//       sucess: true,
//       user,
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };

export const editProfile = async (req, res) => {
  try {
    // Ensure userId is correctly extracted from the request object
    const userId = req.userId || req.id; // Adjust based on how userId is set

    // Extract data from request
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    // console.log("req.file========", req.file);
    // console.log("profilePicture===========", profilePicture);

    let cloudResponse;

    // Handle file upload if a profile picture is provided
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
      console.log("cloudResponse", cloudResponse);
      console.log("below cloudResponse");
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Update user profile details
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture && cloudResponse)
      user.profilePicture = cloudResponse.secure_url;

    // Save updated user details
    await user.save();

    // Return successful response
    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user,
    });
  } catch (error) {
    // Log error and return server error response
    console.error("Error updating profile: line 251", error);

    return res.status(500).json({
      message: "Internal server error line 253",
      success: false,
    });
  }
};
export const getSuggestedUser = async (req, res) => {
  try {
    const SuggestedUser = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!SuggestedUser) {
      return res.status(400).json({
        message: "Currently do not have any user",
      });
    }
    return res.status(200).json({
      success: true,
      users: SuggestedUser,
    });
  } catch (e) {
    console.log(e);
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const followKrneWala = req.id; // patel
    const jiskoFollowKrunga = req.params.id; // shivani
    if (followKrneWala === jiskoFollowKrunga) {
      return res.status(400).json({
        message: "You cannot follow/unfollow yourself",
        success: false,
      });
    }

    const user = await User.findById(followKrneWala);
    const targetUser = await User.findById(jiskoFollowKrunga);

    if (!user || !targetUser) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }
    // mai check krunga ki follow krna hai ya unfollow
    const isFollowing = user.following.includes(jiskoFollowKrunga);
    if (isFollowing) {
      // unfollow logic ayega
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $pull: { following: jiskoFollowKrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          { $pull: { followers: followKrneWala } }
        ),
      ]);
      return res
        .status(200)
        .json({ message: "Unfollowed successfully", success: true });
    } else {
      // follow logic ayega
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $push: { following: jiskoFollowKrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          { $push: { followers: followKrneWala } }
        ),
      ]);
      return res
        .status(200)
        .json({ message: "followed successfully", success: true });
    }
  } catch (error) {
    console.log(error);
  }
};
