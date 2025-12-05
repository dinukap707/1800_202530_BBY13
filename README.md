# Find It


## Overview
Find-It is a client-side JavaScript web application designed to help students locate and recover lost items on campus. Users can create posts for lost or found items, contact other users to arrange the retrieval of their items, view item details, view lost items on a real-time map, and track their personal app contribution history.
The app integrates Firebase Authentication and Firestore for real-time data management, and uses Mapbox to display item locations interactively.

Developed for our COMP 1800 course, this project highlights user-centered design, teamwork, and production-level web development using Vite and modern JavaScript.
---


## Features

- Create and publish lost or found item posts with images
- Browse all active items and sort/filter results
- Search for items by name, description, tags, or location
- Track personal stats (quests completed, posts made, contacts, points, level)
- Accept and complete quests to help return lost items
- View item locations on an interactive Mapbox map
- View detailed post pages with direct navigation from markers
- Fully responsive interface optimized for mobile

---


## Technologies Used
  
- **Frontend**: HTML, CSS, JavaScript
- **Build Tool**: Vite
- **Backend & Hosting**: Firebase Hosting
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Maps**: Mapbox

---


## Usage

1. Open your browser and visit `https://login-function-d3a97.web.app`.
2. Create an account or log in using Firebase Authentication.
3. Browse the main feed to view active lost-and-found items (posts).
4. Create a new post using the "+" button and upload an item with an image and a description.
5. Use filters or the search bar to narrow down displayed posts.
6. Click an item to view its details, or open the Map to view its location.
7. Accept a quest by contacting a user via post details to help return an item and earn contribution points.
8. Track your stats, level, and completed quests on your Profile page.

---



## Project Structure

```
find-it/
├── font/
│   ├── static
|       ├── ArchivoNarrow-Bold.ttf
|       ├── ArchivoNarrow-BoldItalic.ttf
|       ├── ArchivoNarrow-Italic.ttf
|       ├── ArchivoNarrow-Medium.ttf
|       ├── ArchivoNarrow-MediumItalic.ttf
|       ├── ArchivoNarrow-Regular.ttf
|       ├── ArchivoNarrow-SemiBold.ttf
|       ├── ArchivoNarrow-SemiBoldItalic.ttf
│   ├── ArchivoNarrow-Italic-VariableFont_wght.ttf
│   ├── ArchivoNarrow-VariableFont_wght.ttf
│   ├── OFL.txt
│   ├── README.txt
|
├── images/
│   ├── Mascot.png
│   ├── blackArrow.png
│   ├── blackFilter.png
│   └── blackHome.png
│   ├── blackMap.png
│   ├── blackPlus.png
│   ├── blackProfile.png
│   └── blackSettings.png
│   ├── blackUser.png
│   ├── find_it.png
│   ├── yellowArrow.png
│   └── yellowFilter.png
│   ├── yellowHome.png
│   ├── yellowMap.png
│   ├── yellowPlus.png
│   └── yellowProfile.png
│   ├── yellowSettings.png
│   ├── yellowUser.png
|
├── src/
│   ├── activeQuests.js
│   ├── completedQuests.js
│   ├── details.js
│   ├── firebase.js
│   ├── locationData.js
│   ├── login.js
│   ├── main.js
│   ├── map.js
│   ├── profile.js
│   ├── profileView.js
│   ├── signup.js
│   ├── upload.js
│   └── userStats.js
│
├── styles/
│   ├── activeQuests.css
│   ├── completedQuests.css
│   ├── details.css
│   ├── index.css
|   ├── main.css
│   ├── map.css
│   ├── profileStyle.css
│   ├── profileView.css
|   ├── settingOptionStyle.css
│   ├── settingsStyle.css
│   ├── signup.css
│   ├── stickyFooter.css
|   ├── style.css
│   └── upload.css
│
├── .env
├── .gitignore
├── README.md
├── account_options.html
├── activeQuests.html
├── completedQuests.html
├── data_options.html
├── details.html
├── favicon.ico
├── index.html 
├── main.html
├── map.html
├── upload.html
├── map.html
├── package-lock.json
├── package.json
├── profile.html
├── profileView.html
├── settings.html
├── signup.html
├── social_options.html
├── upload.html

```

---


## Contributors
- Jorja Knaus 
- Devan Lam 
- Dinuka Pinnalawaththage 

---


## Acknowledgments

- Icons sourced from [FLATICON](https://www.flaticon.com/)
- Fonts sourced from [Google Fonts](https://fonts.google.com/)
- Images sourced from [Canva](https://www.canva.com/templates)
- Partial Firebase/JavaScript sourced from COMP1800 Lectures

---


## Limitations and Future Work
### Limitations

- Quest system could be expanded with more roles and rewards
- Map pins currently use simple markers instead of custom graphics

### Future Work

- Add direct messaging or in-app chat for item return coordination
- Add advanced Mapbox features (clustering, navigation routes, etc...)
- Create a dark mode for better usability and user customization

---


## License

This project was made for fun for our COMP1800 final project.
