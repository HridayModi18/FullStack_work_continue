const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models");
require("dotenv").config();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      //google will give name , email , profile etc.
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          let user = await User.findOne({ where: { googleId: profile.id } }); //check if already exist

          const adminEmails = process.env.ADMIN_EMAILS
            ? process.env.ADMIN_EMAILS.split(",").map((e) =>
                e.trim().toLowerCase(),
              )
            : [];

          //.env me check karenge ki adminemail he ya ni
          const assignedRole = adminEmails.includes(email.toLowerCase())
            ? "admin"
            : "user";

          if (!user) {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: email,
              avatar: profile.photos[0] ? profile.photos[0].value : null,
              role: assignedRole,
              lastLogin: new Date()
            });
          } else {
            user.role = assignedRole;
            user.lastLogin = new Date();
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
} else {
  console.warn("⚠ Google OAuth not configured — GOOGLE_CLIENT_ID missing. Login will not work.");
}

module.exports = passport;
