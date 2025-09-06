const mongoose = require('mongoose');
const Home = require("../models/Home");
const home = require("../models/Home");
const User = require("../models/user");

exports.getIndex = (req, res, next) => {
  console.log('session value', req.session);
  home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Homes",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHomes = (req, res, next) => {
  home.find().then((registeredHomes) => {
    res.render("store/Home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getFavouriteList = async (req, res, next) => {
  try {
    const userId = req.session.user._id;

    const user = await User.findById(userId).populate("favourite");

    if (!user) return res.redirect("/login");

    console.log(" Favourite Homes from DB:", user.favourite); 

    res.render("store/favourite-list", {
      pageTitle: "My Favourites",
      currentPage: "favourite",
      isLoggedIn: req.isLoggedIn,
      favouriteHomes: user.favourite,  // Direct array pass
      user: req.session.user,
    });
  } catch (err) {
    console.log("Error fetching favourites:", err);
    res.redirect("/homes");
  }
};

exports.postAddToFavourite = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const homeId = req.body.homeId;

    console.log(" Adding Favourite", { userId, homeId });

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favourite: homeId } }, //  duplicate prevent
      { new: true }
    ).populate("favourite");

    console.log("✅ Updated User:", user); // 

    res.redirect("/favourite");
  } catch (err) {
    console.log("Error adding to favourites:", err);
    res.redirect("/homes");
  }
};


exports.postRemoveFromFavourite = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const homeId = req.params.homeId; // URL se aayega

    const user = await User.findById(userId);

    if (!user) {
      return res.redirect('/login');
    }

    // Filter karke us home ko nikal do
    user.favourite = user.favourite.filter(
      fav => fav.toString() !== homeId.toString()
    );

    await user.save();

    res.redirect('/favourite'); // favourites page pe bhej do
  } catch (err) {
    console.log("Error removing from favourites:", err);
    res.redirect('/favourite');
  }
};


exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home details not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    }
  });
};
