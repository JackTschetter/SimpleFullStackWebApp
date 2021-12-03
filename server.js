/**Include the express modules. */
var express = require("express");

/**Use flash for error message on login.*/
const flash = require('connect-flash');

const url = require('url');

const path = require('path');

/**Create an express application. */
var app = express();

/**Useful in extracting the body portion of an incoming request stream. */
var bodyparser = require('body-parser');

/**fs module, provides an API for interacting with the file system. */
var fs = require('fs');

/**Useful for managing user sessions. */
var session = require('express-session');

/**Include the mysql module. */
var mysql = require('mysql');

/**Bcrypt library is useful for comparing password hashes. */
const bcrypt = require('bcrypt');

/**Library to help reading uploaded files. */
var formidable = require('formidable');

/**Apply the body-parser middleware to all incoming requests.*/
app.use(bodyparser.urlencoded({extended : true}));
app.use(bodyparser.json());

/**Use express session. */
app.use(session ({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  resave: false
}));

/**Server listens on port 9007 for incoming connections. */
app.listen(9007, () => console.log('Listening on port 9007!'));

/**Function to return the welcome page.*/
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/welcome.html');
});

/**Function to return the login page. */
app.get('/login', (req, res, next) => {
    res.sendFile(__dirname + '/client/login.html');
});

/**Function to return the all events page. */
app.get('/allevents',(req,res)=> {
    if(req.session.loggedIn) {
        res.sendFile(__dirname + '/client/allevents.html');
    } else res.redirect('/login')
})

/**Function to return the schedule page. */
app.get('/schedule', (req, res) => {
    if(req.session.loggedIn) {
        res.sendFile(__dirname + '/client/schedule.html');
    } else res.redirect('/login')
});

/**Function to return the addEvents page. */
app.get('/addevents', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(__dirname + '/client/addEvent.html');
    } else res.redirect('/login')
});

/**Function to return the stocks page. */
app.get('/stocks', (req, res) => {
    if(req.session.loggedIn) {
        res.sendFile(__dirname + '/client/stocks.html');
    } else res.redirect('/login')
});

/**Middle ware to serve static files. */
app.use('/client', express.static(__dirname + '/client'));

/*Authenticate user login. Use bcrypt to compare password hashes. */
app.post('/postEventEntry', (request, response) => {
	var connection = mysql.createConnection({
        host: "cse-mysql-classes-01.cse.umn.edu",
        user: "C4131F21U87",
        password: "7599",
        database: "C4131F21U87",
        port: 3306
    });
    connection.connect((err) => {
        if(err) {
            throw err;
        };
    });
    var username = request.body.username;
    var password = request.body.pwd;
    connection.query('SELECT acc_password FROM tbl_accounts', async function(err, results, fields) {
        if(err) {
            throw err;
        }
        else {
            if (results.length>0) {
                const comparison = await bcrypt.compare(password, results[0].acc_password)
                if(comparison) {
                    request.session.loggedIn = true;
                    request.session.username = username;
                    response.redirect('/allevents');
                }
                else {
                    request.flash('Error Message', 'Login failed');
                    request.session.loggedIn = false;
                    response.redirect('/login');
                }
            }
        }
    })
})

/**Route to process form data from addEvent.html. */
app.post('/addEventEntry', (req, res) => {

    let day = req.body.day;
    let event = req.body.event;
    let start = req.body.start;
    let end = req.body.end;
    let location = req.body.location;
    let phone = req.body.phone;
    let info = req.body.info;
    let url = req.body.url;

    /**Connect to the database. */
    var connection = mysql.createConnection({
        host: "cse-mysql-classes-01.cse.umn.edu",
        user: "C4131F21U87",
        password: "7599",
        database: "C4131F21U87",
        port: 3306
    });
    connection.connect((err) => {
        if(err) {
            throw err;
        };
        var sql = "INSERT INTO `tbl_events` (`event_day`, `event_event`, `event_start`, `event_end`, `event_location`, `event_phone`, `event_info`, `event_url`) VALUES ('"+day+"', '"+event+"', '"+start+"', '"+end+"', '"+location+"', '"+phone+"', '"+info+"', '"+url+"')";
        connection.query(sql, function(err, result) {
            if (err) throw err;
            res.redirect('/allEvents');
        });
    });
});

app.get('/tableData', (req, res) => {
	var connection = mysql.createConnection({
        host: "cse-mysql-classes-01.cse.umn.edu",
        user: "C4131F21U87",
        password: "7599",
        database: "C4131F21U87",
        port: 3306
    });
    connection.connect((err) => {
        if(err) {
            throw err;
        };
    });
    /**Query the database and return the data. */
    connection.query("SELECT * FROM tbl_events", (err, result) => {
        if (err) throw err;
        var dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        result.sort(function(a,b) {return dayOrder.indexOf(a.event_day) - dayOrder.indexOf(b.event_day)});
        res.send(result);
    });
});

app.get('/scheduleData', (req, res) => {
    var dayToGet = req.query.day;
    var array = [];
	var connection = mysql.createConnection({
        host: "cse-mysql-classes-01.cse.umn.edu",
        user: "C4131F21U87",
        password: "7599",
        database: "C4131F21U87",
        port: 3306
    });
    connection.connect((err) => {
        if(err) {
            throw err;
        };
    });
    /**Query the database and return the data. */
    connection.query("SELECT * FROM tbl_events", (err, result) => {
        if (err) throw err;
        for (let i=0; i<result.length; i++) {
            if (result[i].event_day.toLowerCase() === req.query.day) {
                array.push(result[i]);
            }
        }
        /**Sort the events by start time. */
        array.sort(function(a,b) {return a.event_start - b.event_start});
        res.send(array);
    });
});

/** DELETE /api/auth/logout. */
app.get('/logout', (req, res) => {
        if (req.session) {
            req.session.destroy(err => {
        if (err) {
            res.status(400).send('Unable to log out')
        } else {
            res.redirect('/login');
        }
        });
    } else {
        res.end()
    }
})

app.get('/stockQuote', (req, res) => {
var stack = require("stack");
var axios = require("axios").default;

    var options = {
        method: 'GET',
        url: 'https://yfapi.net/v7/finance/options/AAPL',
        params: {modules: 'defaultKeyStatistics,assetProfile'},
        headers: {
        'x-api-key': 'PBdSAxy5we2yqwwmQRkyVD3L8gEl8qo58ynu4kz7'
        }
    };

    axios.request(options).then(function (response) {
        console.log(response.data.optionChain.result[0].quote.regularMarketPrice);
	    res.send(response.data.optionChain.result[0].quote);
    }).catch(function (error) {
	    console.error(error);
    });
});

/**Function to return the 404 message and error to client. */
app.get('*', (req, res) => {
    res.sendStatus(404);
});
