const express = require('express');
const cookieParser = require('cookie-parser');
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

// MongoDB connection URI T1-REF1
const uri = "mongodb+srv://view-test:iHda77x4R1ZApdhe@rwmdb.yr8tjx9.mongodb.net/?retryWrites=true&w=majority&appName=rwmdb"; // MongoDB connection URI

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB Client T1-REF2
const client = new MongoClient(uri);

// Connect to MongoDB T1-REF3
async function connectToDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}
connectToDB();

// Default route T3.2-REF1
app.get('/', function(req, res) {
    if (req.cookies.authenticated) {
       res.redirect('/home'); 
    } else {
        res.send('<button onclick="window.location.href=\'/login\'">Login</button> | <button onclick="window.location.href=\'/register\'">Register</button>');       
    }
});

// Registration route T2-REF1
app.get('/register', function(req, res) {
    res.send(`
        <form action="/register" method="post">
            <input type="text" name="userID" placeholder="User ID" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <input type="submit" value="Register">
        </form>
    `);
});
// Registration error handling to require user name and password to move on T2-REF2
app.post('/register', async function(req, res) {
    const { userID, password } = req.body;
    if (!userID || !password) {
        return res.status(400).send('User ID and password are required');
    }

    const database = client.db('authenticate'); // database name
    const collection = database.collection('assignment4'); // collection name

    try {
        await collection.insertOne({ userID, password });
        res.send('Registration successful!<br><button onclick="window.location.href=\'/\'">Go back to home</button>');
    } catch (err) {
        console.error("Error registering user:", err);
        res.send('Error registering user');
    }
});

// Login route 
app.get('/login', function(req, res) {
    res.send(`
        <form action="/login" method="post">
            <input type="text" name="userID" placeholder="User ID"><br>
            <input type="password" name="password" placeholder="Password"><br>
            <input type="submit" value="Login">
        </form>
    `);
});

app.post('/login', async function(req, res) {
    const { userID, password } = req.body;
    const database = client.db('authenticate'); // database name
    const collection = database.collection('assignment4'); // collection name

    const user = await collection.findOne({ userID, password });
    if (user) {
        res.cookie('authenticated', userID, { maxAge: 60000 }); // Set cookie for 1 minute 
        res.redirect('/success');        
    } else {
        res.redirect('/failure');
    }
});

// Endpoint to view Home Page route
app.get('/home', function(req, res){
    res.send('Authentication cookie exists. Value: ' + req.cookies.authenticated + '<br><button onclick="window.location.href=\'/cookies\'">View Cookies</button>');
});

// Endpoint to view Success route T3.2-REF2
app.get('/success', function(req, res){
    res.send('Login successful!<br><button onclick="window.location.href=\'/\'">Go back to home</button>'); 
});

// Endpoint to view Failure route T3.1-REF1
app.get('/failure', function(req, res){
    res.send('Invalid credentials. <button onclick="window.location.href=\'/\'">Go back to home</button>'); 
}); 

// Endpoint to view all cookies T4-REF1
app.get('/cookies', function(req, res) {
    res.send('Active Cookies: ' + JSON.stringify(req.cookies) + '<br><button onclick="window.location.href=\'/clear-cookies\'">Clear Cookies</button>');
});

// Endpoint to clear all cookies T5-REF1
app.get('/clear-cookies', function(req, res) {
    res.clearCookie('authenticated');
    res.send('Cookies cleared successfully.<br><button onclick="window.location.href=\'/\'">Go back to home</button>');
});

// Server start
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
