-- Create database
CREATE DATABASE company_db;

-- Switch to the database
\c company_db;

-- Create Departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    salary NUMERIC(10, 2) NOT NULL,
    department_id INT REFERENCES departments(id)
);

-- Create Employees table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id INT REFERENCES roles(id),
    manager_id INT REFERENCES employees(id) ON DELETE SET NULL
);
