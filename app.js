const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./config/dbConfig");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/task");

const app = express();

connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(morgan("combined"));

app.set("trust proxy", 1);

  app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: true
    }
  })
);


app.use((req, res, next) => {
  res.locals.currentUserId = req.session.userId || null;
  next();
});

app.get("/", (req, res) => {
  if (req.session.userId) return res.redirect("/tasks");
  return res.redirect("/login");
});

app.use("/", authRoutes);
app.use("/", taskRoutes);

app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.use((err, req, res, next) => {
  console.error(
    JSON.stringify(
      {
        time: new Date().toISOString(),
        level: "error",
        path: req.originalUrl,
        message: err.message
      },
      null,
      2
    )
  );

  const status = err.statusCode || 500;

  if (req.accepts("html")) {
    return res.status(status).send("Something went wrong");
  }

  return res.status(status).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    JSON.stringify(
      { time: new Date().toISOString(), level: "info", message: `Server running on ${PORT}` },
      null,
      2
    )
  );
});
