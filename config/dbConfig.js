const mongoose = require("mongoose");

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is missing in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(
      JSON.stringify(
        { time: new Date().toISOString(), level: "info", message: "MongoDB connected" },
        null,
        2
      )
    );
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};
