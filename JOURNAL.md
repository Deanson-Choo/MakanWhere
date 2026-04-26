### 23/3/2026

#### Overall

First day of documenting current features of project

#### Auth

- Currently implemented with JWT authentication with 7d expiry using zustand and async storage.

#### Home

- Currently displays all reviews of user
- Allows for RUD operations

#### Explore

- Currently allows a user to search for a food place via Mapbox
- Allows for Create review for a food place

#### Map

- Basically the same as Home but reviews are displayed via Pins on a map
- Pins are color coded based on review ratings
- Clicking on a pin shows review details such as rating, comment and location

#### Profile

- Currently has a LogOut Button and greets user

### 24/3/2026

#### Home

- Fixed Issue #9
- Added sorting by rating and date
- Added order by DESC or ASC

### 25/3/2026

- Added Tanstack query to ensure all pages are in sync for reviews
- Clear selection on submission in Explore Page
- In home page, now it shows a link to the review on the map
- Fixed #5, #6, #7, #10

### 5/4/2026
- Fixed #15, #16, #17, #18
- Users can now add images
- Users can now edit their profile

### 26/4/2026
#### Backend Testing
- Added and validated endpoints notFound handler
- auth/register endpoint, tested validation and the endpoint itself
- auth/login endpoint, tested validation and incorrect password
- profile endpoint, tested update and delete profile
- reviews endpoint , tested get , update, delete

#### Frontend
- Added profile deletion
- Added loading UI for better feedback