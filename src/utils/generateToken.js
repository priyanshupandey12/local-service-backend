const jwt=require("jsonwebtoken");

const generateToken = (res, user, message) => {
  
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN ,
  });



  return res
    .status(200)
    .cookie("token", token, {
   httpOnly: true,
  secure: true,
  sameSite: "none",
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