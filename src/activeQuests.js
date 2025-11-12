// main.js (updated)
import { db, auth } from './firebase.js';
import {
    onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const displayName = document.getElementById('realName');

// Use an observer to get the current user's UID when the auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        const uid = user.uid;
        console.log("Current user UID:", uid);

        // Now call a function to fetch their specific data using the UID
        fetchUserData(uid);

    } else {
        // User is signed out
        console.log("No user is signed in.");
        displayName.textContent = "Your Name";
        // You might want to redirect them to a login page here
    }
});

// Function to fetch data from Firestore using the user's UID
async function fetchUserData(userId) {
    // Use the provided userId (the UID) as the document ID
    const docRef = doc(db, "users", userId);

    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            const fullName = userData.fullName;

            console.log("User data from Firestore:", userData);
            // Update the HTML element
            displayName.textContent = `${fullName}`;


        } else {
            console.log("No user data found in Firestore for UID:", userId);
            displayName.textContent = "Your Name";
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        displayName.textContent = "Your Name";
    }
}
