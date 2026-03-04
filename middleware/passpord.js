passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // Replace the following with your user retrieval logic
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
