const { Client } = require('pg');
const inquirer = require('inquirer');

// PostgreSQL connection settings
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'company_db',
  password: '123',
  port: 5432,
});

client.connect();

const mainMenu = async () => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add Department',
        'Add Role',
        'Add Employee',
        'Update Employee Role',
        'Exit',
      ],
    },
  ]);

  switch (action) {
    case 'View All Departments':
      await viewDepartments();
      break;
    case 'View All Roles':
      await viewRoles();
      break;
    case 'View All Employees':
      await viewEmployees();
      break;
    case 'Add Department':
      await addDepartment();
      break;
    case 'Add Role':
      await addRole();
      break;
    case 'Add Employee':
      await addEmployee();
      break;
    case 'Update Employee Role':
      await updateEmployeeRole();
      break;
    case 'Exit':
      console.log('Goodbye!');
      client.end();
      return;
  }
  mainMenu();
};

// View all departments
const viewDepartments = async () => {
  const res = await client.query('SELECT * FROM departments;');
  console.table(res.rows);
};

// View all roles
const viewRoles = async () => {
  const query = `
    SELECT roles.id, roles.title, departments.name AS department, roles.salary
    FROM roles
    JOIN departments ON roles.department_id = departments.id;
  `;
  const res = await client.query(query);
  console.table(res.rows);
};

// View all employees
const viewEmployees = async () => {
  const query = `
    SELECT e.id, e.first_name, e.last_name, roles.title, departments.name AS department, roles.salary,
           COALESCE(m.first_name || ' ' || m.last_name, 'None') AS manager
    FROM employees e
    JOIN roles ON e.role_id = roles.id
    JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees m ON e.manager_id = m.id;
  `;
  const res = await client.query(query);
  console.table(res.rows);
};

// Add a department
const addDepartment = async () => {
  const { name } = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Enter the name of the department:' },
  ]);
  await client.query('INSERT INTO departments (name) VALUES ($1)', [name]);
  console.log(`Department "${name}" added.`);
};

// Add a role
const addRole = async () => {
  const departments = await client.query('SELECT * FROM departments;');
  const departmentChoices = departments.rows.map((d) => ({ name: d.name, value: d.id }));

  const { title, salary, department_id } = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'Enter the role title:' },
    { type: 'input', name: 'salary', message: 'Enter the salary for this role:' },
    { type: 'list', name: 'department_id', message: 'Select the department:', choices: departmentChoices },
  ]);

  await client.query('INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
  console.log(`Role "${title}" added.`);
};

// Add an employee
const addEmployee = async () => {
  const roles = await client.query('SELECT * FROM roles;');
  const roleChoices = roles.rows.map((r) => ({ name: r.title, value: r.id }));

  const employees = await client.query('SELECT * FROM employees;');
  const managerChoices = employees.rows.map((e) => ({ name: `${e.first_name} ${e.last_name}`, value: e.id }));
  managerChoices.push({ name: 'None', value: null });

  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    { type: 'input', name: 'first_name', message: 'Enter the first name:' },
    { type: 'input', name: 'last_name', message: 'Enter the last name:' },
    { type: 'list', name: 'role_id', message: 'Select the role:', choices: roleChoices },
    { type: 'list', name: 'manager_id', message: 'Select the manager:', choices: managerChoices },
  ]);

  await client.query(
    'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
    [first_name, last_name, role_id, manager_id]
  );
  console.log(`Employee "${first_name} ${last_name}" added.`);
};

// Update employee role
const updateEmployeeRole = async () => {
  const employees = await client.query('SELECT * FROM employees;');
  const employeeChoices = employees.rows.map((e) => ({ name: `${e.first_name} ${e.last_name}`, value: e.id }));

  const roles = await client.query('SELECT * FROM roles;');
  const roleChoices = roles.rows.map((r) => ({ name: r.title, value: r.id }));

  const { employee_id, role_id } = await inquirer.prompt([
    { type: 'list', name: 'employee_id', message: 'Select the employee:', choices: employeeChoices },
    { type: 'list', name: 'role_id', message: 'Select the new role:', choices: roleChoices },
  ]);

  await client.query('UPDATE employees SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
  console.log('Employee role updated.');
};

mainMenu();
