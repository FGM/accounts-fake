// Write your package code here!
Meteor.loginWithFake = function (arg1, arg2) {
  let options;
  let callback;
  // Support a callback without options
  if (!arg2 && typeof arg1 === "function") {
    callback = arg1;
    options = [];
  }
  else {
    options = arg1;
    callback = arg2;
  }

  // Other options:
  // - methodName: "login"
  // - suppressLoggingIn: false
  Accounts.callLoginMethod({
    methodArguments: [{ "fake": options }],
    userCallback: callback
  });
};
