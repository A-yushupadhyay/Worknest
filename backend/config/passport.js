const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // must match Google Console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          // Create new user with Google data
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            avatarUrl: profile.photos?.[0]?.value || "",
            passwordHash: "", // empty because OAuth login
          });
        } else {
          // Update Google fields if missing
          if (!user.googleId) user.googleId = profile.id;
          if (!user.avatarUrl && profile.photos?.[0]?.value) {
            user.avatarUrl = profile.photos[0].value;
          }
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        console.error("GoogleStrategy error:", err);
        return done(err, null);
      }
    }
  )
);

// ❌ No serializeUser/deserializeUser because we're not using sessions
