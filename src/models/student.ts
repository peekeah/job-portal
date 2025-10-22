import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: {
    type: 'string',
    require: true
  },
  branch: {
    type: 'string',
    require: true
  },
  joining_year: {
    type: 'number',
    require: true
  },
})

const appliedJobsSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.ObjectId,
    ref: "job"
  },
  status: {
    type: 'string',
    enum: ['applied', 'shortlisted', 'hired'],
    default: 'applied'
  }
});

const studentSchema = new mongoose.Schema({
  name: {
    type: 'string',
    require: true
  },
  mobile: {
    type: 'number',
  },
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
  profile_pic: {
    type: 'string',
  },
  college: collegeSchema,
  /*
  interest: [String],
  skills: {
    type: [String],
  },
  */
  bio: {
    type: 'string'
  },
  applied_jobs: [appliedJobsSchema]
});


export default mongoose.models.student || mongoose.model('student', studentSchema);
