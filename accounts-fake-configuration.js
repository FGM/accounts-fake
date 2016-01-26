/**
 * @file
 *   The configuration of accounts-fake.
 */

/**
 * Configure the service from its settings.
 *
 * Remember, fake is a demo service which just demonstrates how to access both
 * public and private parts of configuration and expose them to client and
 * server.
 */
FakeConfiguration = class FakeConfiguration {
  /**
   * Constructor.
   *
   * @param {String} name
   *   The name of the configuration instance.
   * @param {Object} settings
   *   Meteor settings.
   * @param {Mongo.Collection} configurations
   *   The service configuration collection, a Mongo.Collection.
   * @returns {FakeConfiguration}
   *   A memory-only configuration instance.
   */
  constructor(name, settings, configurations) {
    this.service = name;
    this.secret = settings[this.service].secret;
    this.rootFields = settings[this.service].rootFields || ["profile"];
    this.notSecret = settings.public[this.service]["not-secret"];
    this.configurations = configurations;

    if (typeof this.secret === "undefined" || this.secret !== this.notSecret) {
      throw new Meteor.ConfigError(this.service);
    }
  }

  /**
   * Update the stored configuration from the current instance.
   *
   * @return {void}
   */
  persist() {
    const selector = { service: this.service };
    const serviceConfig = _.extend(_.clone(selector), {
      notSecret: this.notSecret,
      rootFields: this.rootFields,
      secret: this.secret
    });

    this.configurations.upsert(selector, serviceConfig);
  }
};
