# FSD Assignment_2

https://github.com/rmit-fsd-2024-s1/s4003401-s4005805-a2

## Important
- The search function is implemented for aesthetic purposes and is not functional.
- When users are prompted to login for the cart and diet planner, they will be redirected to the profile page instead of the cart/diet planner page after successfully logging in, as per the specifications.
- Images and icons are stored in the public folder.
- More product information and the reviews can be displayed by clicking on the product image or name.
- The relationships between the tables are in the `index.js` file
- The reviews have a maximum character limit of 100 characters as per the specifications and the ranking of each star can be seen by hovering over each star. The reviews unit test specifically tests the backend of the SOIL website.

## ER Diagram
- 'NN' stands for 'Not Null' 
- 'U' stands for 'Unique'

## How To Run The Program
1. Ensure Node.js is installed so that you can install the project dependencies if required. Use this link to install Node.js if not already installed:
    - `https://nodejs.org/en/download`
2. Install necessary dependencies by running `npm install` in the 'my-app' folder, 'express' folder and 'admin-app' folder in your terminal if the dependencies aren't already installed. 
3. Navigate to the 'express' folder by running `cd express` in your terminal.
4. Start the servers for both the SOIL website and the admin dashboard by executing `node server.js` in your terminal.
5. On a separate terminal, navigate to the SOIL frontend code by running `cd my-app` in your terminal.
6. Start the SOIL frontend code by executing `npm start` in your terminal.
7. To start the admin dashboard frontend code, go to the 'admin-app' folder by running `cd admin` and then cd `admin-app` in a new terminal.  
8. Start the admin dashboard frontend code by executing `npm start` in your terminal.
9. To run the unit tests, navigate to the 'express' folder and then the 'tests' folder for both the cart and the reviews and then run `npm test`.
## Admin Dashboard
1. **Users Blocking**
    - The Admin can block or unblock users and when users are blocked, an error message will be displayed if they try to login to the SOIL website.

2. **Review Management**:
    - The Admin can flag reviews if deemed inappropriate. These reviews will be updated with the message, `[**** This review has been flagged by the admin due to inappropriate content ****]`. The latest three reviews are displayed in a separate box with the review text, number of stars and the date the review was created. If a review is deleted or flagged by the admin on the dashboard, it will take it out of the dashboard in real time. The reviews deleted by the admin are stored in the database with the status set to 'deleted' to ensure the review text is displayed on the SOIL website indicating that the review has been deleted by the admin while the reviews deleted by the users are taken out of the database.

3.  **Graphical Metrics**:
    - **Average Number of Stars For Each Product**: A bar chart that displays the average number of stars for each product based on active reviews. This metric is useful for understanding user engagement and satisfaction with different products.
    - **Incident Metric FOR Each Product**: The dashboard tracks key metrics such as total reviews, flagged reviews, and deleted reviews. These metrics provide insights into product popularity, review quality, and moderation efforts. This data helps product managers and marketing teams enhance customer satisfaction and product integrity.

### Scenarios Handled
1. **Profanity and Offensive Language**:
    - The 'bad-words', 'profane-words' and 'profanity-check' libraries are used to detect and flag reviews containing offensive language. Multiple libraries that detect offensive content are used to ensure every profane word is accurately detected and dealt with accordingly.
2. **Negative Sentiment**:
    - The 'sentiment' library is used to analyze the sentiment of review text. Reviews with a sentiment score below -1 are flagged as potentially inappropriate. A score of -1 was chosen to ensure that any inappropriate review is detected and flagged immediately. A positive score indicates positive sentiment meaning the review is valid and appropriate. Reviews that score a negative sentiment are due to potentially containing inappropriate language or harsh language.

### Strategies for Handling Inappropriate Content
1. **Automated Flagging**:
    - Reviews containing profane words or negative sentiment are automatically flagged with a message indicating the review has been flagged by the admin due to inappropriate content but these are not displayed on the admin dashboard as the review is already flagged and the corresponding message is displayed on the SOIL website. 
2. **Manual Review Deletion And Flagging**:
    - The admin can manually flag or delete reviews that are deemed inappropriate, irrelevant, or offensive. This allows for handling scenarios that the automated detection might miss, such as hate speech, spam, abusive language and threats to other users.

### Explanation of Metrics
1. **Average Ratings By Product**
    - A bar chart to display the average number of stars per product was used to track the user engagement with varying products. This allows for indicators of popular products and to identify the products with the most user attraction. Products with the least user attraction can also be known which could account for specials on those products if needed based on the average ratings of the products. 
2. **Incident Metric FOR Each Product**
    - The incident metric is represented as a bar chart, breaking down the total number of reviews into categories such as active, flagged, and deleted. This visualization helps the admin monitor the health and integrity of reviews for each product. It highlights areas of concern, such as an unusually high number of flagged reviews, which may suggest a need for product improvements or better moderation guidelines. This metric is essential for understanding the overall impact of reviews on the products and helps in making informed decisions regarding product management and marketing strategies.


## References For Product Images
*Organic Apples*
Photo by <a href="https://unsplash.com/@_k8_?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">K8</a> on <a href="https://unsplash.com/photos/red-apples-on-brown-wooden-table-hRbt11o8cEU?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
 *Organic Carrots*
 Photo by <a href="https://unsplash.com/@jannerboy62?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Nick Fewings</a> on <a href="https://unsplash.com/photos/a-pile-of-carrots-sitting-next-to-each-other-d9gDUaDpnes?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

 *Organic Tomatoes*
 Photo by <a href="https://unsplash.com/@enginakyurt?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">engin akyurt</a> on <a href="https://unsplash.com/photos/a-large-pile-of-red-tomatoes-sitting-on-top-of-each-other-Pocwc14MKN0?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
*Organic Spinach*
Photo by <a href="https://unsplash.com/@phillip_larking?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Phillip Larking</a> on <a href="https://unsplash.com/photos/a-close-up-of-some-leaves-jcx3S5jfzmA?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
*Organic Kale*
Photo by <a href="https://unsplash.com/@charbeck?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Char Beck</a> on <a href="https://unsplash.com/photos/macro-shot-photography-of-lettuce-5eM6sRTCCUc?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Eggs*
Photo by <a href="https://unsplash.com/@madseneqvist?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Mads Eneqvist</a> on <a href="https://unsplash.com/photos/a-bunch-of-eggs-that-are-in-a-box-X77nWyRG2Ck?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Milk*
Photo by <a href="https://unsplash.com/@thisisjackcole?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Jack Cole</a> on <a href="https://unsplash.com/photos/a-bottle-of-organic-milk-sitting-on-a-table-4PhVsBICtJQ?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Cheese*
Photo by <a href="https://unsplash.com/@dirtjoy?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Zoe Schaeffer</a> on <a href="https://unsplash.com/photos/white-round-food-on-stainless-steel-tray-YFmkU2EOm-8?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Bread*
Photo by <a href="https://unsplash.com/@judowoodo_?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Jude Infantini</a> on <a href="https://unsplash.com/photos/selective-focus-photography-of-sliced-bread-rYOqbTcGp1c?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Chicken*
Photo by <a href="https://unsplash.com/@purzlbaum?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Claudio Schwarz</a> on <a href="https://unsplash.com/photos/roasted-chicken-on-white-ceramic-plate-4qJlXK4mYzU?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Quinoa*
Photo by <a href="https://unsplash.com/@bamin?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Pierre Bamin</a> on <a href="https://unsplash.com/photos/brown-and-white-pebbles-on-ground-oZ4Krez3X5o?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Blueberries*
Photo by <a href="https://unsplash.com/@videmusart?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Syd Wachs</a> on <a href="https://unsplash.com/photos/bowl-of-blueberries-LyL7sVozl_Y?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Avocados*
Photo by <a href="https://unsplash.com/@gilndjouwou?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Gil Ndjouwou</a> on <a href="https://unsplash.com/photos/sliced-avocado-fruit-on-brown-wooden-table-cueV_oTVsic?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Sweet Potatoes*
Photo by <a href="https://unsplash.com/@cosmicwriter?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Loren Biser</a> on <a href="https://unsplash.com/photos/a-pile-of-wood-vP5guwApg0g?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Almond Butter*
Photo by <a href="https://unsplash.com/@tetiana_bykovets?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Tetiana Bykovets</a> on <a href="https://unsplash.com/photos/clear-glass-jar-with-brown-liquid-Ht7ZhGt2UXg?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Chia Seeds*
Photo by <a href="https://unsplash.com/@joannakosinska?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Joanna Kosinska</a> on <a href="https://unsplash.com/photos/black-and-gray-pebbles-6MlhT-THmk4?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Bananas*
Photo by <a href="https://unsplash.com/@rodreis?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Rodrigo dos Reis</a> on <a href="https://unsplash.com/photos/yellow-banana-fruit-on-brown-wooden-table-DkTuGvgPotA?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
*Organic Broccoli*
Photo by <a href="https://unsplash.com/@ceritadikit?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Adi Rahman</a> on <a href="https://unsplash.com/photos/green-broccoli-in-close-up-photography-wpJzb1lX5Ac?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
*Organic Grapes*
Photo by <a href="https://unsplash.com/@rrajputphotography?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Rajesh Rajput</a> on <a href="https://unsplash.com/photos/purple-grapes-lot-y2MeW00BdBo?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
*Organic Peaches*
Photo by <a href="https://unsplash.com/@mjwaddell?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Michael Waddell</a> on <a href="https://unsplash.com/photos/shallow-focus-photo-of-red-apple-fruits-IDs8ajdEUjg?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
*Organic Strawberries*
Photo by <a href="https://unsplash.com/@sviathuzii?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Sviatoslav Huzii</a> on <a href="https://unsplash.com/photos/red-strawberries-on-white-ceramic-plate-I497Uc8xWXQ?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Oranges*
Photo by <a href="https://unsplash.com/@sweetsimplesunshine?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Jen Gunter</a> on <a href="https://unsplash.com/photos/orange-fruits-on-white-ceramic-plate-A4BBdJQu2co?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
*Orgainc Lettuce*
Photo by <a href="https://unsplash.com/@cuartodeiibra?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Mel Elías</a> on <a href="https://unsplash.com/photos/green-and-white-leaves-on-white-background-e2ZNgrXmZgM?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Garlic*
Photo by <a href="https://unsplash.com/@farrrah?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Farah Alabbouchi</a> on <a href="https://unsplash.com/photos/garlic-lot-on-black-surface-ubgCpgU4P9k?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Orgainc Onions*
Photo by <a href="https://unsplash.com/@abhishek_hajare?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">ABHISHEK HAJARE</a> on <a href="https://unsplash.com/photos/red-onion-on-brown-wooden-table-D9h2-RxM1rE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Potatoes*
Photo by <a href="https://unsplash.com/@lmablankers?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Lars Blankers</a> on <a href="https://unsplash.com/photos/brown-potato-lot-B0s3Xndk6tw?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Corn*
Photo by <a href="https://unsplash.com/@lellen81?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Lynn Danielson</a> on <a href="https://unsplash.com/photos/yellow-corn-in-close-up-photography-aEIMhuA-Ij8?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Cucumbers*
Photo by <a href="https://unsplash.com/@harshalhirve?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Harshal S. Hirve</a> on <a href="https://unsplash.com/photos/cucumber-lot-2GiRcLP_jkI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Capsicum*
Photo by <a href="https://unsplash.com/@jannerboy62?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Nick Fewings</a> on <a href="https://unsplash.com/photos/orange-bell-peppers-on-white-ceramic-plate-gpP-OkJ5BbI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

*Organic Mushrooms*
Photo by <a href="https://unsplash.com/@waldemarbrandt67w?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Waldemar</a> on <a href="https://unsplash.com/photos/brown-mushrooms---9pYUo2f04?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
