// web-test-runner.config.mjs
import { chromeLauncher } from "@web/test-runner-chrome";

/** @type {import('@web/test-runner').TestRunnerConfig} */
export default {
  files: ["test/**/*.test.js"],
  nodeResolve: true,
  browsers: [
    chromeLauncher({
      launchOptions: {
        headless: true, // run headless, no GUI
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
      },
    }),
  ],
  coverage: true,
  coverageConfig: {
    include: ["src/**/*.js"],
    exclude: ["**/*.test.js", "test/**", "node_modules/**"],
    report: ["text", "html"],
  },
};
