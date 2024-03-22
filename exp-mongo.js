const express = require('express');
const cookieParser = require('cookie-parser');
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

// MongoDB connection URI
const uri = "mongodb+srv://test-user:Password12345!@rwmdb.yr8tjx9.mongodb.net/?retryWrites=true&w=majority&appName=rwmdb"; // Replace with your MongoDB connection URI

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB Client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
async function connectToDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}
connectToDB();

// Default route
app.get('/', function(req, res) {
    if (req.cookies.authenticated) {
        res.send('Authentication cookie exists. Value: ' + req.cookies.authenticated + '<br><a href="/cookies">View Cookies</a>');
    } else {
        res.send('<a href="/login">Login</a> | <a href="/register">Register</a>');
    }
});

// Registration route
app.get('/register', function(req, res) {
    res.send('<form action="/register" method="post"><input type="text" name="userID" placeholder="User ID"><br><input type="password" name="password" placeholder="Password"><br><input type="submit" value="Register"></form>');
});

app.post('/register', async function(req, res) {
    const { userID, password } = req.body;
    const database = client.db('your_database_name'); // Replace with your database name
    const collection = database.collection('users'); // Replace with your collection name

    try {
        await collection.insertOne({ userID, password });
        res.send('Registration successful!<br><a href="/">Go back to home</a>');
    } catch (err) {
        console.error("Error registering user:", err);
        res.send('Error registering user');
    }
});

// Login route
app.get('/login', function(req, res) {
    res.send('<form action="/login" method="post"><input type="text" name="userID" placeholder="User ID"><br><input type="password" name="password" placeholder="Password"><br><input type="submit" value="Login"></form>');
});

app.post('/login', async function(req, res) {
    const { userID, password } = req.body;
    const database = client.db('your_database_name'); // Replace with your database name
    const collection = database.collection('users'); // Replace with your collection name

    const user = await collection.findOne({ userID, password });
    if (user) {
        res.cookie('authenticated', userID, { maxAge: 60000 }); // Set cookie for 1 minute
        res.send('Login successful!<br><a href="/">Go back to home</a>');
    } else {
        res.send('Invalid credentials. <a href="/">Go back to home</a>');
    }
});

// Endpoint to view all cookies
app.get('/cookies', function(req, res) {
    res.send('Active Cookies: ' + JSON.stringify(req.cookies) + '<br><a href="/clear-cookies">Clear Cookies</a>');
});

// Endpoint to clear all cookies
app.get('/clear-cookies', function(req, res) {
    res.clearCookie('authenticated');
    res.send('Cookies cleared successfully.<br><a href="/">Go back to home</a>');
});

// Server start
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
