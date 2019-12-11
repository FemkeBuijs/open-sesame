import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT;

import {
  authorizeUser,
} from './controllers/user';

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

app.listen(port, () => console.log(`Sesame can only open when you are listening on port ${port}!`));

// REST API ROUTES
app.get('/', (req, res) => res.send('It works! Now start hitting those api endpoints in Postman!'));
app.post('/user/authorize', authorizeUser);
