const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const Users = require("../models/users");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
      proxy: true,
    },
    function (accessToken, refreshToken, profile, cb) {
      // finding a previous user
      Users.findOne(
        {
          googleId: profile.id,
        },
        function (err, user) {
          if (err) return cb(err);
          if (user) {
            if (!user.avatar) {
              user.avatar = profile.photos[0].value;
              user.save(function (err) {
                return cb(null, user);
              });
            } else {
              return cb(null, user);
            }
          } else {
            // create new user with google ID
            const newUser = new Users({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
            });
            newUser.save(function (err) {
              if (err) return cb(err);
              return cb(null, newUser);
            });
          }
        }
      );
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  Users.findById(id, function (err, user) {
    done(err, user);
  });
});
