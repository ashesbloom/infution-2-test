require("dotenv").config();
const mongoose = require("mongoose");
const AuthCode = require("./models/AuthCode");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const docs = await AuthCode.find({}, { code: 1, isUsed: 1, used: 1 }).limit(20);
  console.log(docs);
  process.exit();
});
