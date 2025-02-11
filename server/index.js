//dependencies//imports
const express = require('express')
const pg = require('pg')
//express app
const app = express();
//db client 
const client = new pg.Client("postgres://kseniia:kseniya3@localhost:5432/acme_hr_db");
app.use(express.json())

app.get('/api/employees', async (req, res, next) => {
    try {
        const SQL = `
        SELECT * FROM employees
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (ex) {
        next(ex);
    }
})

app.get('/api/departments', async (req, res, next) => {
    try {
        const SQL = `
            SELECT * FROM departments
            `;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (ex) {
        next(ex);
    }
})


app.post('/api/employees', async (req, res, next) => {
    try {
        const SQL = `
              
    INSERT INTO employees(name, department_id) VALUES($1, (SELECT id from departments WHERE name=$2)),
                `;
        const response = await client.query(SQL, [req.body.employee]);
        res.send(response.rows);
    } catch (ex) {
        next(ex);
    }
})

// My own code DELETE /api/employees/:id
app.delete('/api/employees/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const SQL = `
         DELETE FROM employees WHERE id=$1
        `;
        const response = await client.query(SQL, [id]);
        res.send(response.rows[0]);
    } catch (ex) {
        next(ex);
    }
});

// My own code PUT /api/employees/:id
app.put('/api/employees/:id', async (req, res, next) => {
    const { id } = req.params;
        const { name, departmentName } = req.body;
    try {
        
        const SQL = `
        UPDATE employees SET 
        name=$1, 
        department_id = (SELECT id from departments WHERE name=$2),
        updated_at = NOW()
        WHERE id=$3
        RETURNING *;
        `;
        const response = await client.query(SQL, [name, departmentName, id]);
        res.send(response.rows[0]);
    } catch (ex) {
        next(ex);
    }
});

    const init = async () => {
        await client.connect();
        const SQL = `
    DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS departments;
    
    CREATE TABLE departments(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50)
    );
    
    CREATE TABLE employees(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    department_id INTEGER REFERENCES departments(id) NOT NULL
    );
    
    INSERT INTO departments(name) VALUES('accounting'), ('creative'), ('it'), ('hr'); 
    INSERT INTO employees(name, department_id) VALUES('Donna', (SELECT id from departments WHERE name='accounting')),
    ('Alistair', (SELECT id from departments WHERE name='creative')),
    ('Tracey', (SELECT id from departments WHERE name='it')),
    ('Henry Russell', (SELECT id from departments WHERE name='hr'));`

        await client.query(SQL);
        app.listen(3000, () => console.log('listening on port 3000'))
    }

    init();
