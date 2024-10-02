// Required Modules
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

// Routes

// Home route
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: clientPath });
});

app.get('/users', async (req, res) => {
    try {
        const data = await fs.readFile(dataPath, 'utf-8');

        const customers = JSON.parse(data);
        if (!costumers) {
            throw new Error("Error no users available");
        }
        res.status(200).json(customers);
    } catch (error) {
        console.error("Problem getting the users" + error.message);
        res.status(500).json({ error: "Problem reading users" });
    }
});

// About route
app.get('/about', (req, res) => {
    res.sendFile('pages/about.html', { root: serverPublic });
});

// Form route
app.get('/form', (req, res) => {
    res.sendFile('pages/form.html', { root: serverPublic });
});
// Form Submission Route
app.post('/submit-form', async (req, res) => {
    try {
        const { name, password, PIN } = req.body; //UPDATE THIS
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
        let user = customers.find(u => u.name === name && u.password === password && u.PIN === PIN) //UPDATE THIS
        if (user) {
            user.message.push(message);
        } else {
            user = { name, superpower, universe };
            customers.push(user);
        }

        // Save updated customers
        await fs.writeFile(dataPath, JSON.stringify(customers, null 2));
        res.redirect('/form');
    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).send('An error occured while processing your submission.');
    }
});

//update user route (currently just logs and sends a response)
app.put('/update-user/:currentName/:currentPassword/:currentPIN', async (req, res) => {
    try {
        const { currentName, currentPassword, currentPIN } = req.params;
        const { newName, newPassword, newPIN } = req.body;
        console.log('Current Customers:', { currentName, currentPassword, currentPIN });
        console.log('New user data:', { newName, newPassword, newPIN });
        const data = await fs.readFile(dataPath, 'utf8');
        if (data) {
            let customers = JSON.parse(data);
            const userIndex = customers.findIndex(user => user.name === currentName && user.superPassword === currentPassword && user.PIN === currentPIN);
            console.log(userIndex);
            if (userIndex === -1) {
                return res.status(404).json({ message: "Customer not found" })
            }
            customers[userIndex] = { ...customers[userIndex], name: newName, password: newPassword, PIN: newPIN };
            console.log(customers);
            await fs.writeFile(dataPath, JSON.stringify(customers, null, 2));

            res.status(200).json({ message: `You sent ${newName} and ${newPassword} and ${newPIN}` });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('An error occurred while updating the customer.');
    }
});
app.delete('/user/:name/:superpower/:universe', async (req, res) => {
    try {
        const { name, password, PIN } = req.params
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
        const userIndex = customers.findIndex(user => user.name === name && user.password === password && user.PIN === PIN); 


        // ended off here 10/2/2024


        console.log(userIndex);
        if (userIndex === -1) {
            return res.status(404).send('User not found');
        }
        // splice the users array with the intended delete name and email
        superheros.splice(userIndex, 1);
        try {
            await fs.writeFile(dataPath, JSON.stringify(superheros, null, 2));
        } catch (error) {
            console.error("Failed to write to database");
        }
        // send a success deleted message
        res.send('User deleted successfully');
    } catch (error) {
        res.status(500).send('There was an error deleting user');
    }
});