const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Use email to find existing user
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
          // Create new user if not found
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            avatarUrl: profile.photos?.[0]?.value || "",
            passwordHash: "", // empty because OAuth
          });
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Required for passport to work
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err, null));
});
