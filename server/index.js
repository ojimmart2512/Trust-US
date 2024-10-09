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
app.get('/sign-in.html', (req, res) => {
    res.sendFile('pages/sign-in.html', { root: serverPublic });
});
app.get('/home.html', (req, res) => {
    res.sendFile('pages/home.html', { root: serverPublic });
});
app.get('/deposit.html', (req, res) => {
    res.sendFile('pages/deposit.html', { root: serverPublic });
});
app.get('/action.html', (req, res) => {
    res.sendFile('pages/action.html', { root: serverPublic });
});
app.get('/'), (req, res) => {
    res.sendFile('/client/src/img', { root: serverPublic });
}

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
// Update user route (currently just logs and sends a response)
app.put('/update-user/:currentName/:currentEmail', async (req, res) => {
    try {
        const { currentName, currentEmail } = req.params;
        const { newName, newEmail } = req.body;
        console.log('Current user:', { currentName, currentEmail });
        console.log('New user data:', { newName, newEmail });
        const data = await fs.readFile(dataPath, 'utf8');
        if (data) {
            let users = JSON.parse(data);
            const userIndex = users.findIndex(user => user.name === currentName && user.email === currentEmail);
            console.log(userIndex);
            if (userIndex === -1) {
                return res.status(404).json({ message: "User not found" })
            }
            users[userIndex] = { ...users[userIndex], name: newName, email: newEmail };
            console.log(users);
            await fs.writeFile(dataPath, JSON.stringify(users, null, 2));

            res.status(200).json({ message: `You sent ${newName} and ${newEmail}` });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('An error occurred while updating the user.');
    }
});



app.delete('/user/:name/:password', async (req, res) => {
    try {
        const { name, password} = req.params
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
// ended off here 10/2/2024

