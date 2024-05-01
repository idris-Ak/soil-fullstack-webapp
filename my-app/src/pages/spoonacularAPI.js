//Spoonacular API (2024) Spoonacular Food API, accessed 3 April 2024. https://spoonacular.com/food-api
const API_KEY = 'f604c576907846a798d6edc09f0c1c91';

export const getSpoonacularMealPlan = async (preferences, planDuration) => {
    //Get all the user inputs to generate meal plan accordingly
    let userPreferenceParams = {
        apiKey: API_KEY,
        timeFrame: planDuration,
        diet: preferences.dietaryPreferences.join(','),
        targetCalories: calculateCalories(preferences)
    };

    //Add health goal preferences to generate the meal plan
    const healthGoalsParams = adjustQueryParamsForGoals(preferences);
    //Join base params and health goal params
    const finalParams = { ...userPreferenceParams, ...healthGoalsParams };
    const queryParams = new URLSearchParams(finalParams);
    //URL to generate meal plan from the API
    const url = `https://api.spoonacular.com/mealplanner/generate?${queryParams}`;
    
    try {
        //Try to get connection with API and display error messages if required accordingly
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch meal plan: ${response.statusText}`);
        }
        const data = await response.json();

        //For a daily plan, Spoonacular's API returns a "meals" array directly
        if (planDuration === 'day') {
            if (!data.meals || data.meals.length === 0) {
                throw new Error('No meals data found for the daily plan.');
            }
            //Directly return the meals for daily plan
            return { meals: data.meals }; 
        }
        
        //For a weekly plan, Spoonacular's API nests meal data within a "week" object
        else if (planDuration === 'week') {
            if (!data.week || Object.keys(data.week).length === 0) {
                throw new Error('No meals data found for the weekly plan.');
            }
            //Extract the week data for weekly plan
            return { week: data.week }; 
        }

    } catch (error) {
        console.error("Error fetching meal plan:", error);
        throw error;
    }
};

function calculateCalories({ age, weight, height, activityLevel, gender }) {
    //Calculate required calories based upon user input
    age = Number(age);
    weight = Number(weight);
    height = Number(height);

    let bmr = gender === 'male' 
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
    //BMI calculator (2024) Harris Benedict Formula, accessed 3 April 2024. https://www.bmi-calculator.net/bmr-calculator/harris-benedict-equation/
    switch (activityLevel) {
        case 'low': 
        return Math.round(bmr * 1.2);
        case 'moderate': 
        return Math.round(bmr * 1.55);
        case 'high': 
        return Math.round(bmr * 1.725);
        case 'very_high': 
        return Math.round(bmr * 1.9);
        default: 
        return Math.round(bmr * 1.2);
    }
}

//Function to adjust query parameters based on user goals
function adjustQueryParamsForGoals(preferences, baseCalories) {
    let goalsParams = {};
    //Return empty params if no healthGoals are provided or baseCalories is not defined
    if (!preferences.healthGoals || !baseCalories) 
        return {};

    if (preferences.healthGoals.includes('weight loss')) {
        //Adjust calories for a 20% calorie reduction
        goalsParams.targetCalories = Math.round(baseCalories * 0.8);
        //Adjust protein for 20% fewer calories
        goalsParams.targetProtein = Math.round((baseCalories * 0.8) * 0.25 / 4);
    } 
    else if (preferences.healthGoals.includes('weight gain')) {
         //Adjust calories for a 15% calorie increase
        goalsParams.targetCalories = Math.round(baseCalories * 1.15);
        //Adjust protein to a lower percentage
        goalsParams.targetProtein = Math.round((baseCalories * 1.15) * 0.2 / 4);
    } 
    else if (preferences.healthGoals.includes('muscle gain')) {
        //Adjust calories for a 10% calorie increase
        goalsParams.targetCalories = Math.round(baseCalories * 1.1);
        //Adjust protein to a higher percentage
        goalsParams.targetProtein = Math.round((baseCalories * 1.1) * 0.3 / 4);
        //Adjust carbs to a higher percentage for more energy 
        goalsParams.targetCarbs = Math.round((baseCalories * 1.1) * 0.5 / 4);
        //Adjust fats moderately
        goalsParams.targetFat = Math.round((baseCalories * 1.1) * 0.2 / 9);
    } 
    else if (preferences.healthGoals.includes('overall health improvement')) {
        //Adjust protein moderately
        goalsParams.targetProtein = Math.round(baseCalories * 0.2 / 4);
        //Adjust carbs to a higher percentage for more energy 
        goalsParams.targetCarbs = Math.round(baseCalories * 0.5 / 4); 
        //Adjust fats to a healthy level
        goalsParams.targetFat = Math.round(baseCalories * 0.3 / 9); 
    }

    return goalsParams;
}
