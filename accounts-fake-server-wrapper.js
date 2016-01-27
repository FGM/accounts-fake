/**
 * @file
 * On the server side, an accounts package basically performs these tasks:
 *
 * - it exposes additional fields on Meteor.user() for autopublish
 * - it registers as a login handler with a given service name
 * - it publishes its runtime service configuration
 */

/**
 * The name under which to register this service.
 **/
const SERVICE_NAME = "fake";

// Register the package as an accounts service.
let service = new FakeService(SERVICE_NAME, Accounts);
service.register();

// Inject its configuration on startup and use it to set up autopublishing.
Meteor.startup(() => {
  let configuration = new FakeConfiguration(SERVICE_NAME, Meteor.settings, ServiceConfiguration);
  configuration.persist();
  service.setConfiguration(configuration);
  service.registerAutopublish();
});
