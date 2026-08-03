const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const adminSchema = new mongoose.Schema(
{

    name:{
        type:String,
        required:true,
        trim:true
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },

    password:{
        type:String,
        required:true,
        minlength:6,
        select:false
    },

    role:{
        type:String,
        enum:["admin"],
        default:"admin"
    }

},
{
    timestamps:true
});

// ==========================
// Hash Password
// ==========================
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ==========================
// Compare Password
// ==========================
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ==========================
// Hide Password
// ==========================
adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};


module.exports = mongoose.model("Admin", adminSchema);