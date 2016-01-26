let name = "mock-service";
let mockConfiguration =  { public: {}};
mockConfiguration[name] = {
  secret: "any"
};
mockConfiguration.public[name] = {};
const mockServiceConfiguration = ServiceConfiguration.configurations;

Tinytest.add("Testing correct configuration", function (test) {
  mockConfiguration.public[name]["not-secret"] = "any";

  var f = new FakeConfiguration(name, mockConfiguration, mockServiceConfiguration);

  test.equal("FakeConfiguration", f.constructor.name);
});

Tinytest.add("Testing incorrect configuration", function (test) {
  mockConfiguration.public[name]["not-secret"] = "other";

  var instantiator = function () {
    new FakeConfiguration(name, mockConfiguration, mockServiceConfiguration);
  };

  test.throws(instantiator, function (e) {
    return e.name === "ServiceConfiguration.ConfigError";
  });
});
