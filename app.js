const express = require("express");
require("express-async-errors");

const cookieParser = require("cookie-parser");
const csrf = require("host-csrf");

const app = express();
require("dotenv").config(); // Load environment variables

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // Use `express.urlencoded()` instead of `body-parser`
app.use(express.json()); // Ensure JSON body parsing

// Initialize Cookie Parser (BEFORE Session & CSRF)
app.use(cookieParser(process.env.COOKIE_SECRET || "defaultSecret"));

// Session Setup
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  uri: url,
  collection: "mySessions",
});
store.on("error", console.log);

const sessionParms = {
  secret: process.env.SESSION_SECRET || "defaultSessionSecret",
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  sessionParms.cookie.secure = true;
}

app.use(session(sessionParms));

// Initialize Passport
const passport = require("passport");
const passportInit = require("./passport/passportInit");
passportInit();
app.use(passport.initialize());
app.use(passport.session());

// Flash messages middleware
app.use(require("connect-flash")());
app.use(require("./middleware/storeLocals")); // Should be after flash

// CSRF Protection (AFTER cookie-parser & session)
const csrfOptions = {
  protected_operations: ["POST"],
  protected_content_types: ["application/json", "application/x-www-form-urlencoded"],
  development_mode: app.get("env") !== "production",
};
app.use(csrf(csrfOptions));

// Ensure CSRF token is available in views
app.use((req, res, next) => {
  csrf.token(req, res);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"));

// Protected routes
const auth = require("./middleware/auth");
const secretWordRouter = require("./routes/secretWord");
app.use("/secretWord", auth, secretWordRouter);

// 404 Error Handling
app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

// General Error Handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

// Start Server
const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.error(error);
  }
};
start();
