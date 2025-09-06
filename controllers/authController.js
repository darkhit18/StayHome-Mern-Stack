const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    isLoggedIn: false,
    errors: [], // always send empty array by default
    oldInput: { email: "", password: "" },
    user: {},
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    currentPage: "signup",
    isLoggedIn: false,
    errors: [],
    user: {},
    oldInput: {
      firstname: "",
      lastname: "",
      email: "",
      userType: "",
    },
  });
};

exports.postSignup = [
  check("firstname")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name must be at least 2characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First Name can only contain letters"),

  check("lastname")
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage("last Name can only contain alphabets"),

  check("email")
    .isEmail()
    .withMessage("Please Enter a valid email")
    .normalizeEmail(),

  check("password")
    .isLength({ min: 8 })
    .withMessage("Password should be atleast 8 char long")
    .matches(/[A-Z]/)
    .withMessage("Password should contain atleast one Uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password should contain atleast one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password should contain atleast one number")
    .matches(/[!@#$&^%]/)
    .withMessage("Password should contain atleast one Special character")
    .trim(),

  check("confirmpassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password do not Match");
      }
      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("Please select a userType")
    .isIn(["guest", "host"])
    .withMessage("Invalid userType"),

  check("terms")
    .notEmpty()
    .withMessage("Please accept the terms & condition")
    .custom((value, { req }) => {
      if (value !== "on") {
        throw new Error("Please accept the terms & condition");
      }
      return true;
    }),

  async (req, res, next) => {
    const { firstname, lastname, email, password, userType } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: "false",
        errors: errors.array().map((error) => error.msg),
        user: {},
        oldInput: {
          firstname,
          lastname,
          email,
          password,
          userType,
        },
      });
    }

    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          firstname,
          lastname,
          email,
          password: hashedPassword,
          userType,
        });
        return user.save();
      })
      .then(() => {
        res.redirect("/login");
      })
      .catch((err) => {
        return res.status(422).render("auth/signup", {
          pageTitle: "Signup",
          currentPage: "signup",
          isLoggedIn: false,
          errors: [err.message],
          oldInput: { firstname, lastname, email, userType },
          user: {},
        });
      });
  },
];

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: "false",
      errors: ["User does not exits"],
      oldInput: {email},
      user: {},
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: "false",
      errors: ["Invalid Password"],
      oldInput: {password},
      user: {},
    });
  }
  req.session.isLoggedIn = true;
  req.session.user = user; 
  await req.session.save();
  res.redirect("/");
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};
