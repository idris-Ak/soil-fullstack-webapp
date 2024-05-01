import React, { useState, useEffect } from 'react';
import { getSpoonacularMealPlan } from './spoonacularAPI.js'
import { Button, Form, Container, Row, Col, Card, Alert, ListGroup, Image, ButtonGroup, ToggleButton } from 'react-bootstrap';

function DietPlan() {
//State for all the user preferences
const [preferences, setPreferences] = useState({
		age: '',
		weight: '',
		height: '',
		activityLevel: '',
		dietaryPreferences: [],
		healthGoals: '',
		gender: '',
});
//State for setting the meal plan by getting the meal plan from local storage if there is any
const [mealPlan, setMealPlan] = useState(() => JSON.parse(localStorage.getItem('mealPlan') || '{}'));
//State to show the user preferences form if the user wants to edit their preferences
const [showForm, setShowForm] = useState(() => !localStorage.getItem('mealPlan') || localStorage.getItem('editingPreferences') === 'true');
//State to set the plan duration, daily or weekly
const [planDuration, setPlanDuration] = useState(() => localStorage.getItem('planDuration') || 'day');
const [error, setError] = useState('');
const [showError, setShowError] = useState(false);
const [selectedGender, setSelectedGender] = useState('');

useEffect(() => {
    //Update local storage when planDuration changes
    localStorage.setItem('planDuration', planDuration);
}, [planDuration]);

const handleSelectGender = (gender) => {
	setSelectedGender(gender);
	setPreferences({ ...preferences, gender });
};

const handleSelectPlanDuration = (duration) => {
	setPlanDuration(duration);
};

//Style for active toggle buttons for plan duration and gender
const activeToggleStyle = {
	backgroundColor: '#4CAF50',
	borderColor: '#4CAF50',
	color: '#ffffff',
};

//Style for inactive toggle buttons for plan duration and gender
const inactiveToggleStyle = {
	backgroundColor: '#f8f9fa',
	borderColor: '#ced4da',
	color: '#6c757d',
};

useEffect(() => {
	if (error) {
		setShowError(true);
		setTimeout(() => {
			setShowError(false);
        //Show the error for 4 seconds
		}, 4000);
	}
}, [error]);

const handleChange = (e) => {
	const { name, value, type, checked } = e.target;
	//Filter out meals based upon dietary preferences
    if (type === 'checkbox') {
        setPreferences(prev => {
          const newDietaryPreferences = checked
            ? [...prev.dietaryPreferences, value]
            : prev.dietaryPreferences.filter(pref => pref !== value);
          return { ...prev, dietaryPreferences: newDietaryPreferences };
        });
      } else {
        setPreferences(prev => ({ ...prev, [name]: value }));
      }
    };


const validatePreferences = (preferences) => {
    let errors = [];
    //Define array for valid health goals
    const validHealthGoals = ['weight loss', 'weight gain', 'muscle gain', 'overall health improvement'];

    //Split the health goals by commas and trim spaces
    const userHealthGoals = preferences.healthGoals.toLowerCase().split(',').map(goal => goal.trim());
    //Define an array to store the invalid health goals
    const invalidGoals = [];

    if (userHealthGoals.includes('weight loss') && userHealthGoals.includes('weight gain')) {
      errors.push("You cannot have both weight loss and weight gain as goals. Please adjust your health goals.");
    }

    //Validate that each health goal is one of the valid options
    userHealthGoals.forEach(goal => {
      if (!validHealthGoals.includes(goal) && goal !== "") {
        invalidGoals.push(goal);
      }
    });

    //Add a single error for all invalid goals
    if (invalidGoals.length > 0) {
      errors.push(`Invalid health goal(s): ${invalidGoals.join(', ')}. Valid goals are ${validHealthGoals.join(', ')}.`);
    }

  //Check if age, weight, and height is positive or not
  if (preferences.age <= 0) {
	errors.push("Age must be a positive number.");
  }

  if (preferences.weight <= 0) {
	errors.push("Weight must be a positive number.");
  }

  if (preferences.height <= 0) {
	errors.push("Height must be a positive number.");
  }

  //Check for realisitic age and body measurements
  if (preferences.age < 13 || preferences.age > 120) {
		errors.push("Age must be between 13 and 120.");
  }

 if (preferences.weight < 20 || preferences.weight > 300) {
		errors.push("Weight must be between 20kg and 300kg.");
 }

if (preferences.height < 100 || preferences.height > 250) {
		errors.push("Height must be between 100cm and 250cm.");
 }

	return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Check if user has selected a gender or not
    if (!selectedGender) {
      setError('');
      setTimeout(() => setError('Please select a gender.'), 0);
      return;
    }
    const validationErrors = validatePreferences(preferences);
    if (validationErrors.length > 0) {
      setError('');
      setTimeout(() => setError(validationErrors.join(" ")), 0);
      return;
    }
    //Retrieve the meal plan from the API and check if there is a valid meal plan available based upon the preferences of the user
    try {
      const formattedDietaryPreferences = preferences.dietaryPreferences.join(',');
      const plan = await getSpoonacularMealPlan(preferences, planDuration, formattedDietaryPreferences);
      if (!plan || (planDuration === 'day' && (!plan.meals || !plan.meals.length)) || (planDuration === 'week' && (!plan.week || !Object.keys(plan.week).length))) {
        setError('');
        setTimeout(() => setError('No meals were found. Please adjust your preferences.'), 0);
        return;
      }

      setMealPlan(plan);
      //Set the meal plan to local storage
      localStorage.setItem('mealPlan', JSON.stringify(plan));
      //Remove the editing preferences boolean value from local storage if the meal plan is set
      localStorage.removeItem('editingPreferences');
      setShowForm(false);
    } catch (error) {
     //Display the error in the console if fetching the meal plan isn't successful
      console.error('Error fetching meal plan:', error);
      setError('');
      setTimeout(() => setError(error.message || 'Failed to generate meal plan. Please try again.'), 0);
    }
  };


function MealPlanTable({ mealPlan }) {
	const API_KEY = 'f604c576907846a798d6edc09f0c1c91';
	const [nutritionalDetails, setNutritionalDetails] = useState({});

	useEffect(() => {
		//Fetch the nutrional details for each meal based on daily or weekly plan
        const fetchNutritionalDetails = async () => {
            let meals = []
            if (planDuration === 'week') {
                //Flatten all meals in weekly plan
                meals = Object.values(mealPlan).flatMap(day => day.meals);
            } else if (planDuration === 'day' && mealPlan.meals) {
                //Directly use meals for daily plan
                meals = mealPlan.meals;
            }
				//Try fetching meal nutritional values from API
                const newNutritionalDetails = {};
                for (const meal of meals) {
                    if (meal && meal.id) {
                        try {
                            const response = await fetch(`https://api.spoonacular.com/recipes/${meal.id}/nutritionWidget.json?apiKey=${API_KEY}`);
                            if (response.ok) {
                                const nutrients = await response.json();
                                newNutritionalDetails[meal.id] = nutrients;
                            } else {
                                console.error(`Failed to fetch nutritional details for meal ID: ${meal.id}`);
                            }
                        } catch (error) {
                            console.error("Error fetching nutrition details:", error);
                            newNutritionalDetails[meal.id] = null;
                        }
                    }
                }

                setNutritionalDetails(newNutritionalDetails);
            };

            fetchNutritionalDetails();
        }, [mealPlan]);

const renderMeal = (meal, key, nutrition) => {
	//Get image for each meal from API
	const getImageUrl = (id, imageType) => `https://img.spoonacular.com/recipes/${id}-312x231.${imageType}`;

	return (
		<Row key={key} className="mb-4">
		<Col md={3} className="mb-3">
			<Image src={getImageUrl(meal.id, meal.imageType)} style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: '15px' }} />
		</Col>
		<Col md={6} className="d-flex flex-column justify-content-between">
				<Card.Title style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>
					{meal.title || 'Meal Title Not Available'}
				</Card.Title>
				<Card.Text>
                    {/* Display 'Loading...' for each nutrional detail as it may have a slight delay to retrieve the details from the API */}
                    <span role="img" aria-label="Calories">🔥</span> <strong>Calories:</strong> {nutrition && nutrition.calories ? `${nutrition.calories}kcal` : 'Loading...'} <br />
                    <span role="img" aria-label="Protein">💪</span> <strong>Protein:</strong> {nutrition && nutrition.protein ? nutrition.protein : 'Loading...'} <br />
                    <span role="img" aria-label="Fat">🥑</span> <strong>Fat:</strong> {nutrition && nutrition.fat ? nutrition.fat : 'Loading...'} <br />
                    <span role="img" aria-label="Carbs">🍞</span> <strong>Carbs:</strong> {nutrition && nutrition.carbs ? nutrition.carbs : 'Loading...'}
				</Card.Text>
				<Button variant="primary" href={meal.sourceUrl} target="_blank" style={{ borderRadius: '10px', fontWeight: 'bold', marginBottom: '10px' }}>
					View Full Recipe
				    </Button>
                </Col>
            </Row>
        );
    };


//Generate a unique key for each list item
const generateKey = (prefix, index) => `${prefix}-${index}`;

	return (
	  <div>
		  {/* Handling for weekly meal plan */}
		  {planDuration === 'week' ? (
				Object.entries(mealPlan).map(([day, { meals }], dayIndex) => (
				  <Card key={day} className="mb-5">
					  <Card.Header className="font-weight-bold" style={{fontSize: '1.8rem', fontFamily: 'Lato, sans-serif', marginBottom: '20px', color: '#4CAF50', fontWeight: '700', textAlign: 'center' }}>
						  {day.charAt(0).toUpperCase() + day.slice(1)}
					  </Card.Header>
					  <ListGroup variant="flush">
							{["Breakfast", "Lunch", "Dinner"].map((mealType, mealTypeIndex) => (
								  <React.Fragment key={`${mealType}-${mealTypeIndex}`}>
									<ListGroup.Item style={{ backgroundColor: '#e9ecef', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
										{mealType}
									</ListGroup.Item>
									{meals.map((meal, index) => {
										//Display meal only if it matches the current meal type (breakfast, lunch and dinner)
										if (index % 3 === mealTypeIndex) {
											const nutrition = nutritionalDetails[meal.id] || {};
											return renderMeal(meal, generateKey(dayIndex, index), nutrition);
										}
										return null;
									})}
								</React.Fragment>
							))}
						</ListGroup>
					</Card>
				))
   ) : (
			  //Handling for daily meal plan
			  <Card className="mb-5">
			  <ListGroup variant="flush">
				  {["Breakfast", "Lunch", "Dinner"].map((mealType, mealTypeIndex) => (
						<React.Fragment key={`${mealType}-${mealTypeIndex}`}>
						  <ListGroup.Item style={{ backgroundColor: '#e9ecef', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
							  {mealType}
						  </ListGroup.Item>
                          {/* Display the 'Breakfast', 'Lunch' and 'Dinner' headings to the corresponding meal */}
                            {mealPlan && mealPlan.meals && mealPlan.meals.filter((_, index) => index % 3 === mealTypeIndex).map((meal, index) => {
							  const nutrition = nutritionalDetails[meal.id] || {};
							  return renderMeal(meal, generateKey(mealType, index), nutrition);
						  })}
					  </React.Fragment>
				  ))}
			  </ListGroup>
		  </Card>
	  )}
  </div>
);
}

 //Function to show the form when editing preferences
 const handleEditPreferences = () => {
    localStorage.setItem('editingPreferences', 'true');
    setShowForm(true);
};

return (
    <Container style={{ maxWidth: '1200px', marginTop: '40px', marginBottom: '40px' }}>
      {showForm ? (
        <div style={{ padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)', backgroundColor: '#ffffff' }}>
          <h2 className="text-center mb-4" style={{ fontFamily: 'Lato, sans-serif', fontSize: '2.5rem', color: '#5C832F', marginBottom: '30px' }}>Create Your Diet Plan</h2>
          <Form onSubmit={handleSubmit} className="shadow-sm p-3 mb-5 bg-white rounded" style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '18px' }}>
            {showError && <Alert variant="danger">{error}</Alert>}
            <Row className="mb-3 justify-content-center">
              <Col xs={12} md={8}>
                <Form.Label>Plan Duration</Form.Label>
                <ButtonGroup className="d-flex mb-3">
                  <ToggleButton
                    id="toggle-check-day"
                    type="radio"
                    variant="outline-primary"
                    name="planDuration"
                    value="day"
                    checked={planDuration === 'day'}
                    onChange={(e) => handleSelectPlanDuration(e.currentTarget.value)}
                    style={planDuration === 'day' ? activeToggleStyle : inactiveToggleStyle}
                  >
                    Daily
                  </ToggleButton>
                  <ToggleButton
                    id="toggle-check-week"
                    type="radio"
                    variant="outline-primary"
                    name="planDuration"
                    value="week"
                    checked={planDuration === 'week'}
                    onChange={(e) => handleSelectPlanDuration(e.currentTarget.value)}
                    style={planDuration === 'week' ? activeToggleStyle : inactiveToggleStyle}
                  >
                    Weekly
                  </ToggleButton>
                </ButtonGroup>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group id="formBasicAge">
                  <Form.Label>Age</Form.Label>
                  <Form.Control type="number" placeholder="Enter Your Age" name="age" value={preferences.age} onChange={handleChange} style={{ borderRadius: '5px' }} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Label>Gender</Form.Label>
                <ButtonGroup className="d-flex" required>
                  <ToggleButton
                    id="toggle-male"
                    type="radio"
                    variant="outline-primary"
                    name="gender"
                    value="male"
                    checked={selectedGender === 'male'}
                    onChange={(e) => handleSelectGender(e.currentTarget.value)}
                    style={selectedGender === 'male' ? activeToggleStyle : inactiveToggleStyle}
                  >
                    Male
                  </ToggleButton>
                  <ToggleButton
                    id="toggle-female"
                    type="radio"
                    variant="outline-primary"
                    name="gender"
                    value="female"
                    checked={selectedGender === 'female'}
                    onChange={(e) => handleSelectGender(e.currentTarget.value)}
                    style={selectedGender === 'female' ? activeToggleStyle : inactiveToggleStyle}
                  >
                    Female
                  </ToggleButton>
                </ButtonGroup>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6} style={{ marginTop: '10px' }}>
                <Form.Group id="formBasicWeight">
                  <Form.Label>Weight (kg)</Form.Label>
                  <Form.Control type="number" placeholder="Weight" name="weight" value={preferences.weight} onChange={handleChange} style={{ borderRadius: '5px' }} required />
                </Form.Group>
              </Col>
              <Col md={6} style={{ marginTop: '10px' }}>
                <Form.Group id="formBasicHeight">
                  <Form.Label>Height (cm)</Form.Label>
                  <Form.Control type="number" placeholder="Height" name="height" value={preferences.height} onChange={handleChange} style={{ borderRadius: '5px' }} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group id="formBasicActivityLevel" className="mb-3">
              <Form.Label>Activity Level</Form.Label>
              <Form.Select name="activityLevel" value={preferences.activityLevel} onChange={handleChange} style={{ borderRadius: '5px' }} required>
                <option value="">Select Activity Level</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="very_high">Very High</option>
              </Form.Select>
            </Form.Group>
            <Form.Group style={{ marginBottom: '10px', marginTop: '10px' }}>
              <Form.Label>Dietary Preferences</Form.Label>
              <Row>
                {['Vegetarian', 'Vegan', 'Ketogenic', 'Gluten-Free', 'Dairy-Free'].map((option) => (
                  <Col xs={12} sm={6} md={4} lg={2} key={option} className="mb-2" style={{ fontSize: '16px' }}>
                    <Form.Check
                      type="checkbox"
                      id={`diet-${option}`}
                      label={option}
                      name="dietaryPreferences"
                      value={option.toLowerCase()}
                      onChange={handleChange}
                      /* Format each dietary preference to lower case to match with the API's format of the preferences */
                      checked={preferences.dietaryPreferences.includes(option.toLowerCase())}
                      className="ms-2"
                    />
                  </Col>
                ))}
              </Row>
            </Form.Group>
            <Form.Group id="formBasicHealthGoals" className="mb-3">
              <Form.Label>Health Goals</Form.Label>
              <Form.Control type="text" placeholder="e.g., weight loss, muscle gain" name="healthGoals" value={preferences.healthGoals} onChange={handleChange} style={{ borderRadius: '5px' }} />
            </Form.Group>
            <div className="d-grid">
              <Button type="submit" style={{ backgroundColor: '#4CAF50', borderColor: '#4CAF50', borderRadius: '5px', fontSize: '20px', marginTop: '20px' }}>
                Generate Meal Plan
              </Button>
            </div>
          </Form>
        </div>
      ) : (
        <div>
          {/* Display specific daily or weekly meal planner with the option to edit preferences */}
          <h2 style={{ fontSize: '2.5rem' }}>Your {planDuration === 'week' ? 'Weekly' : 'Daily'} Meal Plan</h2>
          {planDuration === 'week' ? (
            <MealPlanTable mealPlan={mealPlan.week} planDuration="week" />
          ) : (
            <MealPlanTable mealPlan={{ meals: mealPlan.meals }} planDuration="day" />
          )}
          <Button variant="secondary" onClick={handleEditPreferences}>Edit Preferences</Button>
        </div>
      )}
    </Container>
  );
}

export default DietPlan;