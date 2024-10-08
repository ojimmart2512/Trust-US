const express = require('express');
const path = require('path');
const fs = require('fs').promises;

// Initialize Express application
const app = express();

// Define paths
const clientPath = path.join(__dirname, '..', 'client/src');
const dataPath = path.join(__dirname, 'data', 'users.json');
const serverPublic = path.join(__dirname, 'public');
// Middleware setup
app.use(express.static(clientPath)); // Serve static files from client directory
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

// sign up route
app.get('/sign-in', (req, res) => {
    res.sendFile('pages/sign-in.html', { root: serverPublic });
});
// sign up Submission Route
app.post('/submit-sign-in', async (req, res) => {
    try {
        const { email, password} = req.body; //UPDATE THIS
        let customers = [];
        try {
            const data = await fs.readFile(dataPath, 'utf-8');
            customers = JSON.parse(data);
        } catch (error) {
            // If file doesn't exist or is empty, start with an empty array
            console.error('Error reading user data:', error);
            customers = [];
        }

        // Find or Create user
        let user = customers.find(u => u.email === email && u.password === password ) //UPDATE THIS
        if (user) {
            user.message.push(message);
        } else {
            user = { email, password};
            customers.push(user);
        }

        // Save updated customers
        await fs.writeFile(dataPath, JSON.stringify(customers, null, 2));
        res.redirect('/sign-up');
    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).send('An error occured while processing your submission.');
    }
});