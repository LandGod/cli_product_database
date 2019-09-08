var mysql = require('mysql');
var inquirer = require('inquirer');

// Standard connection for local database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");

    // Start the rest of the program until this asynchronous action has been completed
    mainPrompt();
});

function mainPrompt() {
    inquirer.prompt([
        {
            name: 'initialChoice',
            type: 'list',
            message: 'Hello! What would you like to do?',
            choices: [
                'View All Available Merchandise',
                'View Products by Department',
                'Search by Product Name',
                'Purchase Product by ID',
                'Exit Store'
            ]
        }
    ]).then(answers => {
        switch (answers.initialChoice) {
            case 'View All Available Merchandise':
                printAllProducts();
                break;
            case 'View Products by Department':
                // TODO:
                break;
            case 'Search by Product Name':
                // TODO:
                break;
            case 'Purchase Product by Index Number':
                // TODO:
                break;
            case 'Exit Store':
            default:
                console.log('Thank you! Come again!');
                process.exit();
        };
    });
};

// This function takes a list of objects returned from a mySQL query and converts them
// into a single object indexed by the product number, for better display in a table
function parseTable(rawData) {
    let tableObj = {}
    for (let i = 0; i < rawData.length; i++) {
        tableObj[rawData[i].item_id] = {
            'Product Name': rawData[i].product_name,
            'Department': rawData[i].department_name,
            'Price': `$${rawData[i].price}`
        }
    }

    return tableObj;
};

// Prompts the user to confirm that they wish to continue, then return to main menu
function thenBackToMenu() {

    inquirer.prompt([
        {
            type: 'input',
            name: 'continue',
            message: "Press [Enter] to continue"
        }
    ]).then(x => {
        mainPrompt();
    })
};


function printAllProducts() {
    connection.query('SELECT * FROM products WHERE stock > 0',
        function (err, res) {
            if (err) { throw (err) };
            if (res) {
                console.table(parseTable(res));
            }

            else { console.log(`Error: Database Unreachable`) };


            // When done, after user hits enter, return back to first prompt
            
            thenBackToMenu();

        })
};