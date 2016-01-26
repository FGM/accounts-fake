/**
 * @file
 *   The main fake service class.
 */

/**
 * A class providing the mechanisms for the "fake" accounts service.
 *
 * @type {FakeService}
 */
FakeService = class FakeService {
  /**
   * Constructor.
   *
   * @param {String} name
   *   The name of the fake accounts service.
   * @param {AccountsServer} accounts
   *   The AccountsServer service.
   *
   * @returns {FakeService}
   *   The unconfigured service instance.
   */
  constructor(name, accounts) {
    this.accounts = accounts;
    this.name = name;
  }

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
  autopublishFields() {
    const rootFields = this.getRootFields();

    const allFields = ["services." + this.name];
    const publicFields = [allFields + ".public"];

    const fields = {
      forLoggedInUser: rootFields.concat(allFields),
      forOtherUsers: rootFields.concat(publicFields)
    };

    return fields;
  }

  /**
   * A replacement for the default user creation hook.
   *
   * @param {Object} options
   *   A hash of properties to inject into the raw user object to complete it.
   * @param {Object} user
   *   A raw user object from the login process.
   *
   * @returns {Object}
   *   A full user object.
   */
  hookUserCreate(options, user) {
    /* Inject our custom fields:
     * - profile from the accounts-base default
     * - username and emails from accounts-password with builtin support in -base
     * - our own extra field, which will be saved, but only exposed with autopublish
     */
    const rootFields = this.getRootFields();
    rootFields.forEach(function (property) {
      if (options[property]) {
        user[property] = options[property];
      }
    });
    return user;
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
  loginHandler(loginRequest) {
    let loginResult;

    // A login request goes through all these handlers to find its login handler.
    // So in our login handler, we only consider login requests which have an
    // field matching our service name, i.e. "fake". To avoid false positives,
    // any login package will only look for login request information under its
    // own service name, returning undefined otherwise.
    if (!loginRequest[this.name]) {
      return loginResult;
    }

    const options = loginRequest[this.name];

    // Never forget to check tainted data like these.
    // noinspection JSCheckFunctionSignatures
    check(options, {
      action: Boolean,
      user: String
    });

    // Use our ever-so-sophisticated authentication logic.
    if (!options.action) {
      loginResult = {
        type: this.name,
        error: new Meteor.Error("The login action said not to login.")
      };

      return loginResult;
    }

    // In case of success, normalize the user id to lower case: MongoDB does not
    // support an efficient case-insensitive find().
    const submittedUserId = options.user.toLocaleLowerCase();

    // Return a user
    const serviceData = {
      id: submittedUserId,
      public: { "voodoo": "chile" },
      onProfile: { some: "extra" },
      offProfile: { more: "extra" }
    };

    // Publish part of the package-specific user information.
    const userOptions = {
      // Profile, username, and emails are published by _initServerPublications(,
      // so we can inject them if we so desire.
      profile: {},
      username: submittedUserId,
      emails: [submittedUserId + "@example.com"],
      // But no other field is published unless autopublish is on.
      onlyWithAutopublish: "only with autopublish"
    };
    userOptions.profile[this.name] = serviceData.onProfile;

    return Accounts.updateOrCreateUserFromExternalService(this.name, serviceData, userOptions);
  }

  /**
   * Register service as an accounts service.
   *
   * - Register service as a login handler.
   * - Override the default user creation hook.
   *
   * @see AccountsServer._initServerPublications()
   *
   * @returns {void}
   */
  register() {
    let that = this;
    this.accounts.registerLoginHandler(this.name, function (loginRequest) {
      return that.loginHandler(loginRequest);
    });
    this.accounts.onCreateUser(function (options, user) {
      return that.hookUserCreate(options, user);
    });
  }

  /**
   * Autopublish custom fields on startup, based on configuration.
   *
   * @returns {void}
   */
  registerAutopublish() {
    this.accounts.addAutopublishFields(this.autopublishFields());
  }

  /**
   * Setter for configuration.
   *
   * @param {FakeConfiguration} configuration
   *   A configuration instance.
   *
   * @returns {void}
   */
  setConfiguration(configuration) {
    this.configuration = configuration;
  }

  /**
   * Provides the sanitized list of fields to expose at the root of a user object.
   *
   * Needs configuration.
   *
   * @returns {Array}
   *   An array of field names.
   */
  getRootFields() {
    if (!this.configuration) {
      throw new Meteor.Error("service-unconfigured", "The service needs to be configured");
    }
    const defaultRootFields = [
      // From accounts-base.
      "profile",
      // From accounts-password with accounts-base support.
      "username", "emails",
      // Example of a field only available with autopublish.
      "onlyWithAutopublish"];
    const result = _.intersection(defaultRootFields, this.configuration.rootFields);
    return result;
  }
};
