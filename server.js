const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
    user: '2024_psql_d_usr',
    host: '5.183.188.132',
    database: '2024_psql_dan',
    password: 'hq7L54hC9LEc7YzC',
    port: 5432,
  });

app.post('/register', async (req, res) => {
    const {login, password} = req.body;
    try {
        const hasPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO "user" (login, password) VALUES ($1, $2) RETURNING *',
            [login, hasPassword]
        );
        res.status(201).json({user: result.rows[0]});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка регистрации!'});
    }
});

app.post('/login', async (req, res) => {
    const { login, password } = req.body;
    try {
        const result =  await pool.query('SELECT * FROM "user" WHERE login = $1', 
            [login]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'f41c73428d98fd19c35858d295343a1da40ea0d6736b424b1e215333b3254b01');
            res.json({ token });
        }
        else {
            res.status(404).json({error: 'Ошибка!'});
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошщибка авторизации!'});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Сервер запущен и работает на порту ${PORT}`);
})
