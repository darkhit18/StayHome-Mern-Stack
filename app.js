// Load .env file
require("dotenv").config();

// External Modules
const express = require("express");
const session = require("express-session");
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const MongoDBStore = require("connect-mongodb-session")(session);

// Core Modules
const Path = require("path");

// Local Modules
const rootDir = require("./utils/pathUtil");
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const errorsController = require("./controllers/errors");

const app = express();

// Set view engine
app.set("view engine", "ejs");
app.set("views", "views");

// Environment variables from .env
const DB_PATH = process.env.MONGO_URI;
const PORT = process.env.PORT || 10000;
const SESSION_SECRET = process.env.SESSION_SECRET || "default_secret";

if (!DB_PATH) {
  console.error(" MONGO_URI is missing in .env file");
}
if (!process.env.SESSION_SECRET) {
  console.warn(" SESSION_SECRET not set. Using default secret.");
}

// MongoDB session store
const store = new MongoDBStore({
  uri: DB_PATH,
  collection: "sessions",
});

store.on("error", (err) => {
  console.log("Session store error:", err);
});

// Multer config
const randomString = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multerOption = { storage, fileFilter };

// Middlewares
app.use(express.static(Path.join(rootDir, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(multer(multerOption).single("photo"));
app.use("/uploads", express.static(Path.join(rootDir, "uploads")));
app.use("/host/uploads", express.static(Path.join(rootDir, "uploads")));
app.use("/home/uploads", express.static(Path.join(rootDir, "uploads")));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store,
  })
);

app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn || false;
  next();
});

// Routes
app.use(authRouter); // Auth routes first
app.use(storeRouter);

// Protect /host route
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);

app.use(errorsController.pageNotFound);

// DB connect + server start
mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("Connected to MongoDB successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error while connecting to MongoDB:", err);
  });
