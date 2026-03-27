const { ensureDefaultExercises } = require("./exerciseCatalog");
/**
 * Used by signup function in auth to preload exercises to a user
 * @param {*} user_id 
 * @returns 
 */
async function preload_workouts(user_id) {
    try {
        const preloadSummary = await ensureDefaultExercises(user_id);
        console.log("row count edited: ", preloadSummary.insertedCount);
        //could be redundant but since we new to JS, just incase:
        return {success: true, error: ''};

    } catch (error) {
        return {success: false, error: error};
    }
}

module.exports = { preload_workouts };
