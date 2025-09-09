const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');


passport.use(
    new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
async (accessToken, refreshToken, profile, done) => {
    try {
        // Find or create user
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await User.create({
            name: profile.displayName,
            email: profile.emails && profile.emails[0] && profile.emails[0].value,
            googleId: profile.id,
            avatarUrl: profile.photos && profile.photos[0] && profile.photos[0].value
        });
    }
    return done(null, user);
} catch (err) {
     return done(err, null);
}
  }));