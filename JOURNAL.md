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
