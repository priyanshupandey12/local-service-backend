const jwt=require("jsonwebtoken");

const generateToken = (res, user, message) => {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN ,
  });

  const isProduction = process.env.NODE_ENV === "production";

  return res
    .status(200)
    .cookie("token", token, {
      sameSite: isProduction ? "none" : "lax", 
      secure: isProduction ? true : false,  
      maxAge: 24 * 60 * 60 * 1000, 
    })
    .json({
      success: true,
      message,
      userId: user._id,
      role: user.role
    });
};


module.exports = generateToken;