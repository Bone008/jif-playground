// See: https://github.com/onury/jasmine-console-reporter
var Reporter = require("jasmine-console-reporter");
const reporter = new Reporter({ isVerbose: true });

jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(reporter);
