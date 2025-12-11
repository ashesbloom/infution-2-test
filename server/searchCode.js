require("dotenv").config();
const mongoose = require("mongoose");
const AuthCode = require("./models/AuthCode");

async function search() {
  const codeToFind = "JE9CPMXJI0BZ"; // 👈 replace this

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    const result = await AuthCode.findOne({ code: codeToFind });

    console.log("\nSearch Result:\n", result || "No matching code found.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit();
  }
}

search();
