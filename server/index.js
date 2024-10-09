// Required Modules
const express = require('express');
const path = require('path');
const fs = require('fs').promises;

// Initialize Express application
const app = express();

// Define paths
const clientPath = path.join(__dirname, '..', 'client/src');
const dataPath = path.join(__dirname, 'data', 'customers.json');
const serverPublic = path.join(__dirname, 'public');
const serverPages = path.join(__dirname, 'public/pages');

// Middleware setup
app.use(express.static(clientPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes

// index route
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: serverPages });
});

// customers route
app.get('/customers', async (req, res) => {
    try {
        const data = await fs.readFile(dataPath, 'utf-8');
        const customers = JSON.parse(data);
        if (!customers) {
            throw new Error("Error: no users available");
        }
        res.status(200).json(customers);
    } catch (error) {
        console.error("Problem getting the users: " + error.message);
        res.status(500).json({ error: "Problem reading users" });
    }
});

// About route
app.get('/about', (req, res) => {
    res.sendFile('pages/about.html', { root: serverPublic });
});

// Sign-in route
app.get('/sign-in', (req, res) => {
    res.sendFile('sign-in.html', { root: clientPath });
});

// Form route
app.get('/form', (req, res) => {
    res.sendFile('pages/form.html', { root: serverPublic });
});

// Form Submission Route
app.post('/submit-form', async (req, res) => {
    try {
        const { email, password, message } = req.body;

        let customers = [];
        try {
            const data = await fs.readFile(dataPath, 'utf8');
            customers = JSON.parse(data);
        } catch (error) {
            customers = [];
        }

        let user = customers.find(u => u.email === email && u.password === password);
        if (user) {
            user.messages.push(message);
        } else {
            user = { email, password, messages: message ? [message] : [] };
            customers.push(user);
        }

        await fs.writeFile(dataPath, JSON.stringify(customers, null, 2));
        res.redirect('/sign-in');

    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).send('An error occurred while processing your submission.');
    }
});

// Sign-in processing
app.post('/sign-in', async (req, res) => {
    // Implementation remains the same
});

// Update user route
app.put('/update-user/:currentName/:currentEmail', async (req, res) => {
    // Implementation remains the same
});

// Delete user route
app.delete('/user/:name/:password', async (req, res) => {
    // Implementation remains the same
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
