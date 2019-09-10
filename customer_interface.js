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
                getProductsByDepartment();
                break;
            case 'Search by Product Name':
                getProductByName()
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
function thenBackToMenu(skipPause = false) {

    if (!skipPause) {
        inquirer.prompt([
            {
                type: 'input',
                name: 'continue',
                message: "Press [Enter] to continue"
            }
        ]).then(x => {
            mainPrompt();
        })
    } else {
        mainPrompt();
    }
};


function printAllProducts() {
    connection.query('SELECT * FROM products WHERE stock > 0',
        function (err, res) {
            if (err) { throw (err) }
            else if (res) { console.table(parseTable(res)) }
            else { console.log(`Error: Database Unreachable`) };  // This shouldn't be triggerable

            // When done, after user hits enter, return back to first prompt
            thenBackToMenu();

        })
};

function getProductsByDepartment() {
    connection.query('SELECT DISTINCT department_name FROM products',
        function (err, res) {
            if (err) { throw (err) }
            else {

                // Get list of department names from list of objects
                let depts = res.map(x => x.department_name);

                // Feed list of departments to inqurer
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'whichDepartment',
                        message: 'Which department would you like to browse?',
                        choices: depts
                    }

                    // Then give the user a list of all products in the selected department
                ]).then(answers => {

                    connection.query('SELECT * FROM products WHERE department_name = ?', answers.whichDepartment, function (err, res) {

                        if (err) { throw (err) }
                        else if (res) { console.table(parseTable(res)) }
                        else { console.log(`Error: Database Unreachable`) };  // This shouldn't be triggerable

                        // When done, after user hits enter, return back to first prompt
                        thenBackToMenu();

                    });

                });

            };

        })
};

function getProductByName() {
    inquirer.prompt([
        {
            name: 'searchTerm',
            type: 'input',
            message: 'Enter a term to see related products:'
        }
    ]).then(answer => {

        // Convert user intput into search string by splitting it up and adding some controll character wildcards
        let splitTerm = answer.searchTerm.split(' ');
        let sTerm = '%';
        for (let i = 0; i < splitTerm.length; i++) {
            sTerm = sTerm + splitTerm[i] + '%';
        };

        connection.query('SELECT * FROM products WHERE product_name LIKE ?', sTerm, function (err, res) {

            if (err) { throw (err) }

            // If no results are found, print message and offer to search again or return to main menu
            else if (res.length === 0) {
                inquirer.prompt([
                    {
                        name: 'whatNext',
                        type: 'list',
                        message: 'No results found.',
                        choices: ['Search again', 'Back to main menu']
                    }
                ]).then(answer => {
                    switch (answer.whatNext) {
                        case 'Search again':
                            getProductByName();
                            break;
                        case 'Back to main menu':
                            thenBackToMenu('skip pause');
                            break;
                    }
                })
            }

            // If we do get results, list them for the user and allow them to select one, or quit out
            else {

                productList = [];

                for (let i = 0; i < res.length; i++) {
                    productList.push(res[i].product_name);
                }

                productList.push('New search');
                productList.push('Back to main menu');

                inquirer.prompt([
                    {
                        name: 'pickProduct',
                        type: 'list',
                        message: `${productList.length - 2} products found`,
                        choices: productList
                    }
                ]).then(answer => {
                    switch (answer.pickProduct) {
                        case 'Search again':
                            getProductByName();
                            break;
                        case 'Back to main menu':
                            thenBackToMenu('skip pause');
                            break;
                        default:
                            connection.query('SELECT * FROM products WHERE product_name = ?', answer.pickProduct, function (err, res) {
                                if (err) { throw (err) }
                                else {
                                    console.table(parseTable(res));
                                    inquirer.prompt([
                                        {
                                            name: 'doWithProduct',
                                            type: 'list',
                                            message: ' ',
                                            choices: ['Purchase', 'New search', 'Main menu']
                                        }
                                    ]).then(answer => {
                                        switch (answer.doWithProduct) {
                                            case 'New search':
                                                getProductByName();
                                                break;
                                            case 'Main menu':
                                                thenBackToMenu('skip pause');
                                                break;
                                            case 'Purchase':
                                                placeOrder(res.item_id);
                                        }
                                    });
                                }
                            })
                    }

                })

            }
        });
    });
};

function placeOrder(prodID) {
    //TODO:
    console.log('Product Purchasing not implemented yet. Sorry.')
}