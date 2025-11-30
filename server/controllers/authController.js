const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const JobApplicant = require('../models/applicant');
const Recruiter = require('../models/recruiter');
const dotenv = require('dotenv');
dotenv.config();

const signupController = async (req, res) => {
  try {
    const { email, password, type, name, contactNumber, bio, education, skills, rating, resume, profile } = req.body;

    // Create a new user
    const user = new User({
      email,
      password,
      type,
    });

    await user.save();

    // Create user details based on type
    const userDetails = type === 'recruiter'
      ? new Recruiter({
          userId: user._id,
          name,
          contactNumber,
          bio,
        })
      : new JobApplicant({
          userId: user._id,
          name,
          education,
          skills,
          rating,
          resume,
          profile,
        });

    await userDetails.save();

    // Generate JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      type,
    });
  } catch (err) {
    // Handle errors
    if (err && err.errors) {
      return res.status(400).json({ errors: err.errors });
    }
    res.status(400).json({ error: err.message });
  }
};

const loginController = (req, res, next) => {
  passport.authenticate(
    'local',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json(info);
      }
      // Generate JWT token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({
        token,
        type: user.type,
      });
    }
  )(req, res, next);
};

module.exports = { signupController, loginController };
