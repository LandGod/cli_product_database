DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(100) default 'Miscelaneous',
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER(10) DEFAULT 0,
    PRIMARY KEY (item_id)
);

ALTER TABLE products AUTO_INCREMENT=1000;

INSERT INTO products (product_name, department_name, price, stock)
VALUES ('Ionic Breeze Quatro', 'Home Goods', 29.99, 2000),
('Post-Post-Modern Midcentury Modern Dining Table', 'Home Goods', 89.99, 300),
('32kg raw Beef - Assorted Cuts', 'Food', 437.35, 5),
('Widgets - pack of 5', 'Industrial', 3.75, 3000000),
('Nike Air Jordan IIs', 'Clothing', 499.00, 10),
('Gucci Leather Jacket - Fall 2019 Collection', 'Clothing', 699.00, 200),
("Fruit of the Loom Men's Wool Socks - Pack of 3", 'Clothing', 5.99, 10000),
('Mystery Industrial Solvent - 10oz', 'Industrial', 49.99, 12),
('3M Carbon Fibre Tape JL3251-M', 'Industrial', 28.73, 301),
('Farmer Tim Organic Green Grapes - 10oz Package', 'Food', 5.99, 75),
('"I hate Mondays" combination door mat and guillotine', 'Home Goods', 295.00, 7000),
('"As Seen on TV" combination TV Remote and Beer Koozie', 'Home Goods', '24.99', 983),
('Urefined Existential Dread - 200gl Drum', 'Industrial', 325, 400),
('Ejector Seat for 2019 Ford Fiesta', 'Automotive', 743.00, 12),
('AI Driver Conversion Kit for 2012 Honda Odessy', 'Automotive', 2099.00, 54),
('Military Surplus Spike Strip', 'Automotive', 79.99, 22),
('Banana', 'Food', 0.99, 10000000),
('TSA Surplus Body Scanner - Modle Year 2016', 'Home Goods', 879.00, 35),
('United States Congressperson - 2 Pack', 'Miscelaneous', 30000, 217),
('Vintage Crystal Pepsi Can', 'Food', 99.99, 3);