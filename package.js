Package.describe({
  name: "accounts-fake",
  version: "0.0.1",
  // Brief, one-line summary of the package.
  summary: "A fake accounts package to demonstrate Meteor undocumented accounts API",
  git: "",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.versionsFrom("1.2.1");
  api.use("ecmascript");
  api.use("check");
  api.use("accounts-base");
  api.use("service-configuration");
  api.use("underscore");
  api.addFiles("accounts-fake-client.js", "client");
  api.addFiles("accounts-fake-configuration.js", "server");
  api.addFiles("accounts-fake-server-service.js", "server");
  api.addFiles("accounts-fake-server-wrapper.js", "server");
});

Package.onTest(function (api) {
  api.use("ecmascript");
  api.use("tinytest");
  api.use("accounts-base");
  api.use("accounts-fake");
  api.use("mongo");
  api.use("service-configuration");
  api.use("underscore");

  api.addFiles("accounts-fake-configuration.js", "server");
  api.addFiles("accounts-fake-server-tests.js", "server");
});
