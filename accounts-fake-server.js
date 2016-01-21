/**
 * @file
 * On the server side, an accounts package basically performs these tasks:
 *
 * - it exposes additional fields on Meteor.user() for autopublish
 * - it registers as a login handler with a given service name
 * - it publishes its runtime service configuration
 */

const SERVICE_NAME = "fake";

/**
 * Return the list of onProfile fields available on Meteor.user().
 *
 * This is invoked only if autopublish is enabled.
 *
 * @return {Object}
 *   An object with up to two keys:
 *   - forLoggedInUsers: an array of fields published to the current user
 *   - forOtherUsers: an array of fields published to other users
 */
function autopublishFields() {
  const allFields = "services." + SERVICE_NAME;
  const publicFields = allFields + ".public";

  return {
    forLoggedInUser: [allFields],
    forOtherUsers: [publicFields]
  };
}

/**
 * The fake login handler.
 *
 * @param {Object} loginRequest
 *   The login request passed by Meteor. It will be of interest to the package
 *   only if it contains a key named after the package.
 *
 * @return {Object} The result of a login request
 *   - Undefined if the package does not handle this request.
 *   - False if the package rejects the request.
 *   - A result object containing the user information in case of login success.
 */
function loginHandler(loginRequest) {
  let loginResult;

  // A login request goes through all these handlers to find its login handler.
  // So in our login handler, we only consider login requests which have an
  // field matching our service name, i.e. "fake". To avoid false positives,
  // any login package will only look for login request information under its
  // own service name, returning undefined otherwise.
  if (!loginRequest[SERVICE_NAME]) {
    return loginResult;
  }

  let options = loginRequest[SERVICE_NAME];

  // Never forget to check tainted data like these.
  // noinspection JSCheckFunctionSignatures
  check(options, {
    action: Boolean,
    user: String
  });

  // Use our ever-so-sophisticated authentication logic.
  if (!options.action) {
    loginResult = {
      type: SERVICE_NAME,
      error: new Meteor.Error("The login action said not to login.")
    };

    return loginResult;
  }

  // In case of success, ensure user account exists to find its id.
  let userName = options.user;
  let userCriteria = { username: userName };
  let userDocument = Meteor.users.findOne(userCriteria);
  let userId = userDocument
    ? userDocument._id
    : userName.toLocaleLowerCase();

  // Return a user
  let serviceData = {
    id: userId,
    public: { "voodoo": "chile" },
    onProfile: { some: "extra" },
    offProfile: { more: "extra" }
  };

  // Publish part of the package-specific user information.
  let userOptions = {
    profile: {}
  };
  userOptions.profile[SERVICE_NAME] = serviceData.onProfile;

  return Accounts.updateOrCreateUserFromExternalService(SERVICE_NAME, serviceData, userOptions);
}

/**
 * Configure the service from its settings.
 *
 * Remember, this is a demo service which just demonstrates how to access both
 * public and private parts of configuration and expose them to client and
 * server.
 *
 * @return {void}
 */
function configure() {
  let settings = Meteor.settings;
  let secret = settings[SERVICE_NAME].secret;
  let notSecret = settings.public[SERVICE_NAME]["not-secret"];

  if (typeof secret === "undefined" || secret !== notSecret) {
    throw new Meteor.ConfigError(SERVICE_NAME);
  }

  let serviceConfig = {
    service: SERVICE_NAME,
    secret: secret,
    notSecret: notSecret
  };

  // Unlike OAuth, we always reload the service configuration on application startup.
  let configurations = ServiceConfiguration.configurations;
  let selector = { service: SERVICE_NAME };
  configurations.upsert(selector, serviceConfig);
}

Meteor.startup(configure);
Accounts.registerLoginHandler(SERVICE_NAME, loginHandler);
Accounts.addAutopublishFields(autopublishFields());
