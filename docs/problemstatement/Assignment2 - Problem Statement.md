Problem Statement:

Develop a minimal yet functional book review platform (UI and Backend) with basic user authentication, CRUD operations for book reviews, rating aggregation, and a basic recommendation feature.

Core Features and Requirements:

1. User Authentication

· Signup/Login/Logout (email + password)

o Use token-based authentication (e.g., JWT)

o Data model: User ID, email, hashed password, name

2. Books Listing & Search

· Users should be able to:

o View a paginated list of all books

o Search books by title or author

o Data model: Book ID, title, author, description, cover image (URL), genres, published year

3. Reviews & Ratings (CRUD)

· Users can:

o Create, read, update, delete their own reviews

o Rate books on a 1–5 scale

o Data model: Review ID, book ID, user ID, text, rating (1–5), timestamp

4. Average Rating Calculation:

· Each book should display:

o Average rating (rounded to 1 decimal)

o Total number of reviews

· Automatically updated when a review is added/edited/deleted

5. User Profile:

· Shows:

o List of reviews written

o Favourite books (user can mark/unmark)

6. Recommendations

· Return a list of books the user may like based on:

o Top-rated books (default for MVP)

o Books similar to user's favourites or genres

o Use LLM based service APIs like OpenAI to provide recommendations.

7. Spec driven development: · As Ritesh showed in the session (Recording), we need to do this development via spec driven.

· You should first generate PRD document md file, covering most of the PRD aspects like functional requirements, goals, target users, constraints, etc.

· Generate design document with a high-level component diagram in md file. Cover design document aspects like non-functional aspects, tech stack, etc.

· Based on PRD and design documents, create a task breakdown into a md file. Get the project development done via Copilot/Cursor based on this task breakdown file.

8. Unit Testing:

· Write unit test cases for the backend service and make sure overall code coverage is more than 80%.

8. Deployment:

· Write terraform script to create infra for both frontend and backend services.

· Create an infra pipeline to create application resources.

· Create a pipeline to deploy the code to frontend and backend services