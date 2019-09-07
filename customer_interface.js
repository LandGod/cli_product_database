var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    mainPrompt();
});

function mainPrompt() {
    inquirer.prompt([
        {
            name: 'initialChoice',
            type: 'list',
            choices: [
                'View All Available Merchandise',
                'View Products by Department',
                'Search by Product Name',
                'Purchase Product by ID',
                'Exit Store'
            ]
        }
    ]).then(answers => {
        switch(answers.initialChoice) {
            case 'View All Available Merchandise':
                // TODO:
                break;
            case 'View Products by Department':
                // TODO:
                break;
            case 'Search by Product Name':
                // TODO:
                break;
            case 'Purchase Product by ID':
                // TODO:
                break;
            case 'Exit Store':
            default: 
                console.log('Thank you! Come again!');
                process.exit();
        };
    });
};

function printAllProducts() {
    //TODO:
};