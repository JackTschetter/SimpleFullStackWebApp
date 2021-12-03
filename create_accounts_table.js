const mysql = require("mysql");

const dbCon = mysql.createConnection({
    host: "", //Replace with your host name
    user: "", //Replace with user data base id
    password: "", //Replace with user password
    database: "", //Replace with your host name
    port: 3306
});

console.log("Attempting database connection");
dbCon.connect(function (err) {
    if (err) {
        throw err;
    }
    console.log("Connected to database!");

    const sql = `CREATE TABLE tbl_accounts (
        acc_id       INT NOT NULL AUTO_INCREMENT,
        acc_name     VARCHAR(20),
        acc_login    VARCHAR(20),
        acc_password VARCHAR(200),
        PRIMARY KEY (acc_id)
    )`;

    console.log("Attempting to create table: tbl_accounts");
    dbCon.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Table tbl_accounts created");
    });
    dbCon.end();
});
