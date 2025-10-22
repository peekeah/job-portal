import mongoose, { Schema } from "mongoose";

const schema = new Schema({
  email: {
    type: 'string',
    validate: {
      validator: function (v: string) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: "Please enter a valid email"
    },
    required: [true, "Email required"]
  },
  password: {
    type: "string",
    require: true
  },
  userType: {
    type: "string",
    enum: ["student", "company", "admin"],
    default: "student",
  },
})

export default mongoose.models.user || mongoose.model("user", schema)
