const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    jobId: {
      type: String, // Adjusted type to match seeding data
      // required: true,
      // unique: true // Ensure job IDs are unique
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
    },
    title: {
      type: String,
      // required: true,
    },
    pay: {
      type: Number,
      // required: true,
      // validate: [
      //   {
      //     validator: Number.isInteger,
      //     msg: "Pay should be an integer",
      //   },
      //   {
      //     validator: function (value) {
      //       return value >= 0;
      //     },
      //     msg: "Pay should be a positive number",
      //   },
      // ],
    },
    openings: {
      type: Number,
      // required: true,
      // validate: [
      //   {
      //     validator: Number.isInteger,
      //     msg: "Openings should be an integer",
      //   },
      //   {
      //     validator: function (value) {
      //       return value > 0;
      //     },
      //     msg: "Openings should be greater than 0",
      //   },
      // ],
    },
    popularity: {
      type: Number,
      default: 0,
      // validate: [
      //   {
      //     validator: Number.isInteger,
      //     msg: "Popularity should be an integer",
      //   },
      //   {
      //     validator: function (value) {
      //       return value >= 0;
      //     },
      //     msg: "Popularity should be non-negative",
      //   },
      // ],
    },
    stipend: {
      type: Number,
      // validate: [
      //   {
      //     validator: Number.isInteger,
      //     msg: "Stipend should be an integer",
      //   },
      //   {
      //     validator: function (value) {
      //       return value >= 0;
      //     },
      //     msg: "Stipend should be a positive number",
      //   },
      // ],
    },
    companyName: {
      type: String,
      // required: true,
    },
    maxApplicants: {
      type: Number,
      // required: true,
      // validate: [
      //   {
      //     validator: Number.isInteger,
      //     msg: "maxApplicants should be an integer",
      //   },
      //   {
      //     validator: function (value) {
      //       return value > 0;
      //     },
      //     msg: "maxApplicants should be greater than 0",
      //   },
      // ],
    },
    maxPositions: {
      type: Number,
      // required: true,
      // validate: [
      //   {
      //     validator: Number.isInteger,
      //     msg: "maxPositions should be an integer",
      //   },
      //   {
      //     validator: function (value) {
      //       // return value > 0;
      //       return true;
      //     },
      //     msg: "maxPositions should be greater than 0",
      //   },
      // ],
    },
    activeApplications: {
      type: Number,
      default: 0,
      // validate: [
      //   {
      //     validator: Number.isInteger,
      //     msg: "activeApplications should be an integer",
      //   },
      //   {
      //     validator: function (value) {
      //       // return value >= 0;
      //       return true;
      //     },
      //     msg: "activeApplications should be greater than or equal to 0",
      //   },
      // ],
    },
    acceptedCandidates: {
      type: Number,
      default: 0,
      // validate: [
      //   {
      //     validator: Number.isInteger,
      //     msg: "acceptedCandidates should be an integer",
      //   },
      //   {
      //     validator: function (value) {
      //       // return value >= 0;
      //       return true;
      //     },
      //     msg: "acceptedCandidates should be greater than or equal to 0",
      //   },
      // ],
    },
    dateOfPosting: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      // validate: [
      //   {
      //     validator: function (value) {
      //       return this.dateOfPosting < value;
      //     },
      //     msg: "deadline should be greater than dateOfPosting",
      //   },
      // ],
    },
    skillsets: {
      type: [String],
      // required: true,
    },
    jobType: {
      type: String,
      // required: true,
    },
    duration: {
      type: Number,
      min: 0,
      // validate: [
      //   {
      //     validator: Number.isInteger,
      //     msg: "Duration should be an integer",
      //   },
      // ],
    },
    salary: {
      type: Number,
      // validate: [
      //   {
      //     validator: Number.isInteger,
      //     msg: "Salary should be an integer",
      //   },
      //   {
      //     validator: function (value) {
      //       return value >= 0;
      //     },
      //     msg: "Salary should be positive",
      //   },
      // ],
    },
    rating: {
      type: Number,
      max: 5.0,
      default: 0.0,
      // validate: {
      //   validator: function (v) {
      //     return v >= -1.0 && v <= 5.0;
      //   },
      //   msg: "Invalid rating",
      // },
    },
  },
  { collation: { locale: "en" } }
);

module.exports = mongoose.model("Job", schema);
