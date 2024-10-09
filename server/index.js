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
app.use(express.static(clientPath));// Serve static files from client directory
// app.use(express.static(severPublic)); 
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
        if (!customers) {
            throw new Error("Error no users available");
        }
        res.status(200).json(customers);
    } catch (error) {
        console.error("Problem getting the users" + error.message);
        res.status(500).json({ error: "Problem reading users" });
    }
});

// About route
// app.get('/about', (req, res) => {
//     res.sendFile('pages/about.html', { root: serverPublic });
// });

app.get('/sign-in', (req, res) => {
    res.sendFile('/pages/sign-in.html', { root: serverPublic });
});

app.get('/sign-up', (req, res) => {
    res.sendFile('/pages/sign-up.html', { root: serverPublic });
});
// app.get('/', (req, res) => {
//     res.sendFile('/client/src/img', { root: serverPublic });
// });

//Home Route
app.get('/home', (req, res) => {
    res.sendFile('pages/home.html', { root: serverPublic });
});

//action route
app.get('/update-user', (req, res) => {
    res.sendFile('/pages/action.html', { root: serverPublic });
});

// deposit
app.get('/transactions', (req, res) => {
    res.sendFile('/pages/deposit.html', { root: serverPublic });
});


// Form route
app.get('/form', (req, res) => {
    res.sendFile('pages/form.html', { root: serverPublic });
});
// Form Submission Route
app.post('/submit-form', async (req, res) => {
    try {
        const { email, password, PIN } = req.body; //UPDATE THIS
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
        let user = customers.find(u => u.email === email && u.password === password && u.PIN === PIN) //UPDATE THIS
        if (user) {
            user.password.push(password);
        } else {
            user = { email, password, PIN };
            customers.push(user);
        }

        // Save updated customers
        await fs.writeFile(dataPath, JSON.stringify(customers, null, 2));
        res.redirect('/sign-in');
    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).send('An error occured while processing your submission.');
    }
});

// sign in
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Read customers from the data file
        const data = await fs.readFile(dataPath, 'utf8');
        const customers = JSON.parse(data);

        // Find the user
        const user = customers.find(u => u.email === email && u.password === password);

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

//update user route (currently just logs and sends a response)
app.put('/update-user/:currentEmail/:currentPassword/:currentPIN', async (req, res) => {
    try {
        const { currentEmail, currentPassword, currentPIN } = req.params;
        const { newEmail, newPassword, newPIN } = req.body;
        console.log('Current Customers:', { currentEmail, currentPassword, currentPIN });
        console.log('New user data:', { newEmail, newPassword, newPIN });
        const data = await fs.readFile(dataPath, 'utf8');
        if (data) {
            let customers = JSON.parse(data);
            const userIndex = customers.findIndex(user => user.email === currentEmail && user.currentPassword === currentPassword && user.PIN === currentPIN);
            console.log(userIndex);
            if (userIndex === -1) {
                return res.status(404).json({ message: "Customer not found" })
            }
            customers[userIndex] = { ...customers[userIndex], email: newEmail, password: newPassword, PIN: newPIN };
            console.log(customers);
            await fs.writeFile(dataPath, JSON.stringify(customers, null, 2));

            res.status(200).json({ message: `You sent ${newEmail} and ${newPassword} and ${newPIN}` });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('An error occurred while updating the customer.');
    }
});
app.delete('/user/:email/:password/:PIN', async (req, res) => {
    try {
        const { email, password, PIN } = req.params
        // initalize an empty array of 'customers'
        let customers = [];
        // try to read the customers.json file and cache as data
        try {
            const data = await fs.readFile(dataPath, 'utf-8');
            customers = JSON.parse(data);
        } catch (error) {
            return res.status(404).send('Customers data not found')
        }
        // cache the userIndex based on a matching password and email
        const userIndex = customers.findIndex(user => user.email === email && user.password === password && user.PIN === PIN); 
        console.log(userIndex);
        if (userIndex === -1) {
            return res.status(404).send('User not found');
        }
        // splice the customers array with the intended delete password and email
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
