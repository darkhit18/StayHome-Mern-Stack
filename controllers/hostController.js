const home = require("../models/Home");
const Home = require("../models/Home");
const fs = require("fs"); 

exports.getAddhomes = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "Add-Home",
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";

  home.findById(homeId).then((home) => {
    if (!home) {
      console.log("home not found for editing.");
      return res.redirect("/host/host-Home-list");
    }
    console.log(homeId, editing, home);
    res.render("host/edit-home", {
      home: home,
      pageTitle: "Edit your Home",
      currentPage: "host-homes",
      editing: editing,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHostHomes = (req, res, next) => {
  home.find().then((registeredHomes) => {
    res.render("host/host-Home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.postAddhomes = (req, res, next) => {
  console.log("Home registration Successful for:", req.body);
  const { homeName, Price, location, Rating, description } = req.body; // Destructuring to extract properties from req.body

  console.log(homeName, Price, location, Rating, description);
  console.log(req.file);

    if (!req.file) {
    return res.status(422).send("No image provided");
  }

  const photo = req.file.path;

  const Home = new home({
    homeName,
    Price,
    photo,
    location,
    Rating,
    description,
  }); // Creating a new home instance and saving it
  // Assuming the home model's save method adds the home to registeredHomes
  Home.save().then(() => {
    console.log("Home Saved Successfully");
  });

  res.redirect("/host/host-Home-list");
};

exports.postEditHome = (req, res, next) => {
  const { homeName, Price, location, Rating, description, id } =
    req.body; // Destructuring to extract properties from req.body
  home
    .findById(id)
    .then((Home) => {
      Home.homeName = homeName;
      Home.Price = Price;
      Home.location = location;
      Home.Rating = Rating;
      Home.description = description;

      if (req.file) {
        fs.unlink(Home.photo, (err) => {
          if (err) {
            console.log("Error while deleting file ", err);
          }
        });
        Home.photo = req.file.path;
      }
      
      Home.save()
        .then((result) => {
          console.log("Home Updated", result);
        })
        .catch((err) => {
          console.log("error while updating", err);
        });
      res.redirect("/host/host-Home-list");
    })
    .catch((err) => {
      console.log("error while finding home", err);
    });
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log("delete home", homeId);
  home
    .findByIdAndDelete(homeId)
    .then(() => {
      res.redirect("/host/host-Home-list");
    })
    .catch((error) => {
      console.log("Error while deleting", error);
    });
};
