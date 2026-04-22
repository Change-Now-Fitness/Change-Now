const { preloadExerciseCatalog } = require("./exerciseCatalog");
/**
 * Preload helper called during signup.
 *
 * How it fits:
 * - `routes/auth.js` calls this after creating a new user so the exercise
 *   catalog tables exist and baseline data is ready for the frontend.
 */
async function preload_workouts(user_id) {
    try {
        const preloadSummary = await preloadExerciseCatalog(user_id);
        console.log("row count edited: ", preloadSummary.insertedCount);
        //could be redundant but since we new to JS, just incase:
        return {success: true, error: ''};

    } catch (error) {
        return {success: false, error: error};
    }
}

module.exports = { preload_workouts };
