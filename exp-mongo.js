const express = require('express');
const cookieParser = require('cookie-parser');
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

// MongoDB connection URI
const uri = "mongodb+srv://view-test:iHda77x4R1ZApdhe@rwmdb.yr8tjx9.mongodb.net/?retryWrites=true&w=majority&appName=rwmdb"; // MongoDB connection URI

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB Client
const client = new MongoClient(uri);

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

// Styling
const buttonStyle = "background-color: #007bff; color: #fff; padding: 10px 20px; border: none; cursor: pointer; margin-right: 10px;";

// Default route
app.get('/', function(req, res) {
    if (req.cookies.authenticated) {
        res.send('<div style="font-family: Arial; color: #333;">Authentication cookie exists. Value: ' + req.cookies.authenticated + '<br><button style="' + buttonStyle + '" onclick="location.href=\'/cookies\'">View Cookies</button></div>');
    } else {
        res.send('<div style="font-family: Arial; color: #333;"><button style="' + buttonStyle + '" onclick="location.href=\'/login\'">Login</button><button style="' + buttonStyle + '" onclick="location.href=\'/register\'">Register</button></div>');
    }
});

// Registration route
app.get('/register', function(req, res) {
    res.send('<div style="font-family: Arial; color: #333;"><form action="/register" method="post"><input type="text" name="userID" placeholder="User ID" style="margin-bottom: 10px;"><br><input type="password" name="password" placeholder="Password" style="margin-bottom: 10px;"><br><button style="' + buttonStyle + '" type="submit">Register</button></form></div>');
});

app.post('/register', async function(req, res) {
    const { userID, password } = req.body;
    const database = client.db('authenticate'); // database name
    const collection = database.collection('assignment4'); // collection name

    try {
        await collection.insertOne({ userID, password });
        res.send('<div style="font-family: Arial; color: #333;">Registration successful!<br><button style="' + buttonStyle + '" onclick="location.href=\'/\'">Go back to home</button></div>');
    } catch (err) {
        console.error("Error registering user:", err);
        res.send('<div style="font-family: Arial; color: #333;">Error registering user<br><button style="' + buttonStyle + '" onclick="location.href=\'/register\'">Try again</button></div>');
    }
});

// Login route
app.get('/login', function(req, res) {
    res.send('<div style="font-family: Arial; color: #333;"><form action="/login" method="post"><input type="text" name="userID" placeholder="User ID" style="margin-bottom: 10px;"><br><input type="password" name="password" placeholder="Password" style="margin-bottom: 10px;"><br><button style="' + buttonStyle + '" type="submit">Login</button></form></div>');
});

app.post('/login', async function(req, res) {
    const { userID, password } = req.body;
    const database = client.db('authenticate'); // database name
    const collection = database.collection('assignment4'); // collection name

    const user = await collection.findOne({ userID, password });
    if (user) {
        res.cookie('authenticated', userID, { maxAge: 60000 }); // Set cookie for 1 minute
        res.send('<div style="font-family: Arial; color: #333;">Login successful!<br><button style="' + buttonStyle + '" onclick="location.href=\'/\'">Go back to home</button></div>');
    } else {
        res.send('<div style="font-family: Arial; color: #333;">Invalid credentials<br><button style="' + buttonStyle + '" onclick="location.href=\'/login\'">Try again</button></div>');
    }
});

// Endpoint to view all cookies
app.get('/cookies', function(req, res) {
    res.send('<div style="font-family: Arial; color: #333;">Active Cookies: ' + JSON.stringify(req.cookies) + '<br><button style="' + buttonStyle + '" onclick="location.href=\'/clear-cookies\'">Clear Cookies</button></div>');
});

// Endpoint to clear all cookies
app.get('/clear-cookies', function(req, res) {
    res.clearCookie('authenticated');
    res.send('<div style="font-family: Arial; color: #333;">Cookies cleared successfully.<br><button style="' + buttonStyle + '" onclick="location.href=\'/\'">Go back to home</button></div>');
});

// Server start
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
