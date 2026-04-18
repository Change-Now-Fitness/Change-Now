require("dotenv").config();

const { getRuntimeConfigIssues } = require("../config/runtime");

const { errors, warnings } = getRuntimeConfigIssues();

for (const warning of warnings) {
  console.warn(`Warning: ${warning}`);
}

if (errors.length > 0) {
  console.error("Environment validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Environment validation passed.");
