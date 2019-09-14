# CLI Product Database

#### About

This is a project created to learn about and practice with mySQL. 
The idea is to have a command line application that communicates with a SQL server in order to track inventory and allow for products to be 'bought' by a customer through the command line.



## Functionality

Through this app, the customer can view parts of the inventory database and make purchases in a few different ways. When the app is started, the customer is presented with a list of things they can do. Each time a task is completed by the user, they are sent back to this main menu from which they are also given the option to exit the application.

#### View All

While we would no doubt have to remove this feature if using a larger database, for the purposes of this example database, we're allowing users to view the entire list of all products if they would like to. The only piece of data that we hide from customers is the amount of product we have in stock, although we will let them know that information if they attempt to buy more of a particular product than we have.

![Product Overview](https://raw.githubusercontent.com/LandGod/cli_product_database/master/demo/productDBOverview.png)

#### View by Department

Users can also get a list of all departments and select one from the list in order to see all products from a particular department. The list (and selected query) is generated dynamically by querying the SQL database for all unique entries to the department field, so if new departments are added later, they will automatically appear on the list and be selectable. 

![View By Department](https://raw.githubusercontent.com/LandGod/cli_product_database/master/demo/byDepartment.gif)

#### Search by Name

If a user already knows the name of the product they want, or has a term and wants to see if some related product is in stock, they can use this functionality. Any products which contain the entire search query anywhere in their name will be returned. If the query returns no results, the customer can try again with a broader search term. For example, 'space shuttle' will return nothing from our database, but a search for 'a' would return just about all products. Meanwhile, a search for 'socks' returns only one result, as we only have one product with 'socks' anywhere in the name.

In order to give customers a good user experience, they are given the option to buy any product that they select from the list of matching product names, without having to return to the main menu. 

![Search By Name](https://raw.githubusercontent.com/LandGod/cli_product_database/master/demo/SearchByName.gif)

#### Buy With Product Index Number

For returning customers who already know the product index number of the thing they'd like to purchase, they can use this command to cut right to chase, entering that number and the amount they want to make a purchase as fast as possible. If they enter a product index number that doesn't exist in the database, they are simply prompted to try again, or return to the main menu.

![Buy With Index](https://raw.githubusercontent.com/LandGod/cli_product_database/master/demo/buyWithIndex.gif)



### Input and Error Handling

As we know, users will make mistakes and we can't have the program crashing out every time that happens, so several safeguards are in place to deal with this. Firstly, if a user tries to enter a value for product index or amount of product that is not a positive integer, the input will simply not be accepted. In this instance the user is warned and must retry data input until they enter a positive integer. 

If the user enters a valid number, but no product with the specified index number is found, the input is accepted, but the user will be informed and asked to either try again, or return to the main menu. The same thing happens if the user specifies an amount of product to purchase that exceeds the current amount in stock. In this situation the user will also be told the total amount of the product in stock, to avoid further frustration. 

![Handling User Input](https://raw.githubusercontent.com/LandGod/cli_product_database/master/demo/InputHandling.gif)

