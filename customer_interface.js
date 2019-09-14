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
                'Purchase Product by Index Number',
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
                promptForOrder()
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
                ]).then(function (answer) {

                    switch (answer.pickProduct) {
                        case 'Search again':
                            getProductByName();
                            return;
                        case 'Back to main menu':
                            thenBackToMenu('skip pause');
                            return;
                        default:
                            
                            connection.query('SELECT * FROM products WHERE product_name = ?', answer.pickProduct, function (err, res) {
                                if (err) {
                                    console.log('Mysql error of some sort')
                                    throw (err)
                                }
                                else {
                                    console.table(parseTable(res));
                                    inquirer.prompt([
                                        {
                                            name: 'doWithProduct',
                                            type: 'list',
                                            message: ' ',
                                            choices: ['Purchase', 'New search', 'Main menu']
                                        }
                                    ]).then(answer2 => {
                                        switch (answer2.doWithProduct) {
                                            case 'New search':
                                                getProductByName();
                                                break;
                                            case 'Main menu':
                                                thenBackToMenu('skip pause');
                                                break;
                                            case 'Purchase':
                                                promptForOrder(res[0].item_id)

                                        } // switch/case
                                    }); // Inquirer do with product .then()
                                } // else block (if not error)
                            }) // Connection.query
                    } // Switch/case (pick product from list)
                }) //Inquirer pick product .then()
            } // Else block (If valid search result if found)
        }); // Connection.query
    });
};

// Provided a type('buy', or 'restock'), product ID, ammount, and callback function, this will try to update the database to reflect that the specified ammount
// of product was bought. Callback will recieve an object with the following info:
// statusCode: 'success' or 'failed'
// error: 'not enough product' or 'no product found' or 'none'
// currentStock: (int) If success: remaining amount of product in stock, if failure: current ammount of product in stock
function placeOrder(type, prodID, ammount, callback) {
    // Get exitsting ammount of product in stock and make sure there is enough for the customer to buy

    let currentStock;

    connection.query('SELECT stock FROM products WHERE item_id = ?', prodID, function (err, res) {

        if (err) { throw (err) };

        if (res[0] === undefined || res[0].stock === null || res[0].stock === 'null') {
            callback({ statusCode: 'failed', error: 'no product found', currentStock: null })
            return;
        }

        currentStock = parseInt(res[0].stock);

        if (type === 'buy') {

            if (ammount > currentStock) {
                callback({ statusCode: 'failed', error: 'not enough product', currentStock: currentStock })
                return;
            }

            else {
                currentStock -= ammount;
                if (currentStock < 0) { throw (`Ammount of stock for product ID '${prodID}' is negative!`) }
                connection.query("UPDATE products SET stock = ? WHERE item_id = ?", [currentStock, prodID], function (err, res) {
                    if (err) { throw (err) }

                    callback({ statusCode: 'success', error: 'none', currentStock: currentStock })
                    return;

                });
            }

        }
        else if (type === 'restock') {
            currentStock += ammount;
            if (!(typeof currentStock === 'number')) { throw (`Restock number error! Stock value many not be ${currentStock}`) }
            connection.query("UPDATE products SET stock = ? WHERE item_id = ?", [currentStock, prodID], function (err, res) {
                if (err) { throw (err) }

                callback({ statusCode: 'success', error: 'none', currentStock: currentStock })
                return;

            });

        }
        else {
            throw (`Invalid value '${type}' for type argument! Must be 'buy' or 'restock'.`)
        }

    })

}

// Gets info from the user about what they want to buy, then calls placeOrder
function promptForOrder(pID) {

    // Should we ask for a product ID?
    let askForPID; 

    if (pID) { askForPID = false;}
    else { askForPID = true;}

    inquirer.prompt([
        {
            name: 'productID',
            type: 'number',
            message: "Please enter the index number of the product you'd like to buy:",
            validate: isNumber,
            when: askForPID
        },
        {
            name: 'productAmmount',
            type: 'number',
            message: 'How many would you like to buy?',
            validate: isNumber
        }
    ]).then(answers => {

        let finalPID = pID || answers.productID;

        placeOrder('buy', finalPID, answers.productAmmount, result => {
            if (result.statusCode === 'success') {
                console.log('Order placed successfully!');
                thenBackToMenu();
            } else {

                switch (result.error) {

                    case 'not enough product':
                        console.log('Sorry, there is not enough product in stock to fullfill that order.');
                        console.log(`Only ${result.currentStock} units are availble.`)
                        tryAgain('Try a new order?', promptForOrder);
                        break;

                    case 'no product found':
                        tryAgain('No product with that index number was found. Try again?', promptForOrder);
                        break;

                    default:
                        console.log('The buy action failed due to an unknown error.');
                        tryAgain('Try Again?', promptForOrder);
                }
            }
        });

    });
}

// A function for asking the user if they want to try again, or return to the previous action
// Must specify a prompt message to be passed to inquirer, and the function to call if the user asks to try agian.
// May specify a function to call if the user elects not to try again. Defaults to main menu.
function tryAgain(prompt, yes, no) {

    if (!no) {
        no = function () { thenBackToMenu('skip pause') }
    };

    inquirer.prompt([
        {
            name: 'rePromptPrompt',
            type: 'confirm',
            message: prompt
        }
    ]).then(answer => {
        if (answer.rePromptPrompt) {
            yes();
        } else {
            no();
        }
    });
}

function isNumber(text) {

    let num = Number(text);

    if ((typeof (num) === 'number') && !(isNaN(num))) {
        if (num < 0) {
            console.log('')
            return 'Number must be greater than 0.'
        }
        ;
        if (Math.round(num) !== num) { return 'Please enter whole numbers only.' };
        return true;
    }
    return 'Please enter only a number.';
}