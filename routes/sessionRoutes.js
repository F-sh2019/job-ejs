const express = require("express");
const passport = require("passport");
const router = express.Router();
const csrf= require('host-csrf');

const {
  logonShow,
  registerShow,
  registerDo,
  logoff,
} = require("../controllers/sessionController");

router.route("/register").get(registerShow).post((req, res, next) => {
  res.locals.csrf = csrf.token(req, res);
  next();
}, registerDo);

router
  .route("/logon")
  .get(logonShow)
  .post(
    (req, res, next) => {
			if (res.locals.csrf) res.locals.csrf = csrf.refresh(req, res);
			else res.locals.csrf = csrf.token(req, res);

			next();
		},
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/sessions/logon",
      failureFlash: true,
    }),
		(req, res) => {
			csrf.refresh(req, res);
			res.redirect('/');
		}
   
  );
router.route("/logoff").post(logoff);

module.exports = router;