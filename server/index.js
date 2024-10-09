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
// Middleware setup
app.use(express.static(clientPath)); // Serve static files from client directory
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

// Routes

// index route
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: clientPath });
});

app.get('/customers', async (req, res) => {
    try {
        const data = await fs.readFile(dataPath, 'utf-8');

        const customers = JSON.parse(data);
        if (!customers) {
            throw new Error("Error no users available");
        }
        res.status(200).json(customers);
    } catch (error) {
        console.error("Problem getting the users" + error.message);
        res.status(500).json({ error: "Problem reading users" });
    }
});


// Sign-In route
app.get('/sign-in', (req, res) => {
    res.sendFile('pages/sign-in.html', { root: serverPublic });
});
// Action route
app.get('/action', (req, res) => {
    res.sendFile('pages/action.html', { root: serverPublic });
});


//Home Route
app.get('/home', (req, res) => {
    res.sendFile('pages/home.html', { root: serverPublic });
});


// Form route
// app.get('/form', (req, res) => {
//     res.sendFile('pages/form.html', { root: serverPublic });
// });



// Form submission route
app.post('/submit-form', async (req, res) => {
    try {
        const { email, password, message } = req.body; // Add message if needed

        // Read existing users from file
        let customers = [];
        try {
            const data = await fs.readFile(dataPath, 'utf8');
            customers = JSON.parse(data);
        } catch (error) {
            // If file doesn't exist or is empty, start with an empty array
            console.error('Error reading user data:', error);
            customers = [];
        }

        // Find or create user
        let user = customers.find(u => u.email === email && u.password === password);
        if (user) {
            user.messages.push(message);
        } else {
            user = { email, password, messages: [message] };
            customers.push(user);
        }

        // Save updated users
        await fs.writeFile(dataPath, JSON.stringify(customers, null, 2));
        res.redirect('/sign-in');

    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).send('An error occurred while processing your submission.');
    }
});

app.post('/sign-in', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Read users from the data file
        const data = await fs.readFile(dataPath, 'utf8');
        const users = JSON.parse(data);

        // Find the user
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Return the user object
            res.status(200).json(user);
        } else {
            // User not found
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update user route (currently just logs and sends a response)
app.put('/update-user/:currentEmail/:currentPassword', async (req, res) => {
    try {
        const { currentEmail, currentPassword } = req.params;
        const { newEmail, newPassword } = req.body;
        console.log('Current user:', { currentEmail, currentPassword });
        console.log('New user data:', { newEmail, newPassword });
        const data = await fs.readFile(dataPath, 'utf8');
        if (data) {
            let users = JSON.parse(data);
            const userIndex = users.findIndex(user => user.password === currentPassword && user.email === currentEmail);
            console.log(userIndex);
            if (userIndex === -1) {
                return res.status(404).json({ message: "User not found" })
            }
            users[userIndex] = { ...users[userIndex], email: newEmail, password: newPassword };
            console.log(users);
            await fs.writeFile(dataPath, JSON.stringify(users, null, 2));

            res.status(200).json({ message: `You sent ${newEmail} and ${newPassword}` });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('An error occurred while updating the user.');
    }
});



app.delete('/user/:email/:password', async (req, res) => {
    try {
        const { email, password } = req.params
        // initalize an empty array of 'users'
        let customers = [];
        // try to read the users.json file and cache as data
        try {
            const data = await fs.readFile(dataPath, 'utf-8');
            customers = JSON.parse(data);
        } catch (error) {
            return res.status(404).send('Customers data not found')
        }
        // cache the userIndex based on a matching name and email
        const userIndex = customers.findIndex(user => user.email === email && user.password === password);
        console.log(userIndex);
        if (userIndex === -1) {
            return res.status(404).send('User not found');
        }
        // splice the users array with the intended delete name and email
        customers.splice(userIndex, 1);
        try {
            await fs.writeFile(dataPath, JSON.stringify(customers, null, 2));
        } catch (error) {
            console.error("Failed to write to database");
        }
        // send a success deleted message
        res.send('Customer deleted successfully');
    } catch (error) {
        res.status(500).send('There was an error deleting user');
    }
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// ended off here 10/2/2024

