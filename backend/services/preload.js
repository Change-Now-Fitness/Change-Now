const pool = require('../dbconnection');

async function preload_workouts(user_id) {
    try {
        const upload_exercises = await pool.query(
            "INSERT INTO exercise " +
            "(user_id, exercise_name, muscle_group," + 
            " exercise_category, exercise_type, is_custom) VALUES " +
            "($1, 'Bench Press', 'chest', 'strength', 'barbell', false), " +
            "($1, 'Incline Bench Press', 'chest', 'strength', 'barbell', false), " +
            "($1, 'Decline Bench Press', 'chest', 'strength', 'barbell', false), " +
            "($1, 'Lat Pulldown', 'back', 'strength', 'cable', false), " +
            "($1, 'Barbell Row', 'back', 'strength', 'barbell', false), " +
            "($1, 'Barbell Shoulder Press', 'shoulders', 'strength', 'barbell', false), " +
            "($1, 'Front Raise', 'shoulders', 'strength', 'dumbbell', false), " +
            "($1, 'Squat', 'legs', 'strength', 'barbell', false), " +
            "($1, 'Leg Press', 'legs', 'strength', 'machine', false), " +
            "($1, 'Barbell Curl', 'biceps', 'strength', 'barbell', false), " +
            "($1, 'Skullcrusher', 'triceps', 'strength', 'barbell', false), " +
            "($1, 'Standing Calf Raise', 'calves', 'strength', 'machine', false), " +
            "($1, 'Wrist Curl', 'forearms', 'strength', 'barbell', false);", [user_id]
        );

        console.log('row count edited: ', upload_exercises.rowCount);
        //could be redundant but since we new to JS, just incase:
        return {success: true, error: ''};

    } catch (error) {
        return {success: false, error: error};
    }
}

module.exports = { preload_workouts };