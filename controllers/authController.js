const bcrypt = require("bcryptjs");
const { User } = require("../models");

function isValidUsername(username) {
  return typeof username === "string" && username.trim().length >= 3;
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 6;
}

exports.getSignup = (req, res) => {
  return res.render("signup", { error: null });
};

exports.postSignup = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!isValidUsername(username) || !isValidPassword(password)) {
      return res.status(400).render("signup", {
        error: "Username must be at least 3 chars and password at least 6 chars"
      });
    }

    const existing = await User.findOne({ username: username.trim() });
    if (existing) {
      return res.status(409).render("signup", { error: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username: username.trim(), passwordHash });

    req.session.userId = user._id.toString();

    console.log(
      JSON.stringify(
        { time: new Date().toISOString(), level: "info", message: "User signup", userId: req.session.userId },
        null,
        2
      )
    );

    return res.redirect("/tasks");
  } catch (err) {
    return next(err);
  }
};

exports.getLogin = (req, res) => {
  return res.render("login", { error: null });
};

exports.postLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!isValidUsername(username) || typeof password !== "string") {
      return res.status(400).render("login", { error: "Invalid login details" });
    }

    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(401).render("login", { error: "Invalid login details" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).render("login", { error: "Invalid login details" });
    }

    req.session.userId = user._id.toString();

    console.log(
      JSON.stringify(
        { time: new Date().toISOString(), level: "info", message: "User login", userId: req.session.userId },
        null,
        2
      )
    );

    return res.redirect("/tasks");
  } catch (err) {
    return next(err);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    return res.redirect("/login");
  });
};
