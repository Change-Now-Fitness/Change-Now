require("dotenv").config();

const {
  DEFAULT_TEMPLATE_USER_EMAIL,
  syncExerciseTemplatesFromUser,
} = require("../services/exerciseCatalog");

const templateEmail = process.argv[2] || DEFAULT_TEMPLATE_USER_EMAIL;

(async () => {
  try {
    const summary = await syncExerciseTemplatesFromUser(templateEmail);
    console.log(
      `Synced ${summary.syncedCount} exercise templates from ${summary.sourceEmail}`
    );
  } catch (error) {
    console.error("Failed to sync exercise templates:", error);
    process.exitCode = 1;
  }
})();
