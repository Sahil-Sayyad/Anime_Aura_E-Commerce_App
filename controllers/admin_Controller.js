const Admin = require("../models/admin");
const Product = require("../models/product");
const { generateRefreshToken } = require("../config/refreshToken");
const cloudinary = require('cloudinary').v2;

//render sign-In page
module.exports.signIn = async (req, res) => {
  return res.render("admin_sign_in", {
    title: "Anime Aura | Admin Sign In",
  });
};

module.exports.create = async (req, res) => {
  try {
       const admin = [
      {
        email: "admin@gmail.com",
        password: "admin",
      },
    ];
    await Admin.create(admin);
    return res.redirect("/admin/sign-in");
  } catch (err) {
    console.log(err);
    return;
  }
};

//sign in  create session for the admin
module.exports.createSessionAdmin = async function (req, res) {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin.email != email || admin.password != password) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/admin/sign-in");
    }

    const refreshToken = await generateRefreshToken(admin?._id);
    await Admin.findByIdAndUpdate(
      admin.id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    // generateToken(admin?._id);
    req.flash("success", "Logged in Successfully");
    return res.redirect("/admin/dashboard");
  } catch (err) {
    console.log(`Error in createsession controller ${err}`);
    return;
  }
};

module.exports.destroySessionAdmin = async (req, res) => {
  try {
    res.clearCookie("refreshToken");

    req.flash("success", "Sign Out Successfully");
    return res.redirect("/admin/sign-in");
  } catch (err) {
    console.log(err);
    return;
  }
};

module.exports.dashBoard = async (req, res) => {
  try {
    return res.render("admin_panel", {
      title: "Anime Aura | Dashboard",
    });
  } catch (err) {
    console.log(err);
    return;
  }
};


module.exports.createProduct = async (req, res) => {
  try {
    const { title, category, price, shoppingCategory } = req.body;

    const result = await cloudinary.uploader.upload(req.file.path);
    const imageUrl = result.secure_url; // Get the image URL from Cloudinary response

    const product = await Product.create({
      title,
      category,
      price,
      shoppingCategory,
      image: imageUrl,
    });
    console.log(imageUrl);
    req.flash("success", "Product Added Successfully");
    return res.redirect("back");
  } catch (err) {
    console.log(err);
    return;
  }
};
