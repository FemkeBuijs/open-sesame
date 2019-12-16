import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT;

import {
  updatePermissions,
  authoriseUser,
  getHistoryLogs,
} from './controllers/user';

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

app.listen(port, () => console.log(`Sesame can only open when you are listening on port ${port}!`));

// REST API ROUTES
app.get('/', (req, res) => res.send('It works! Now start hitting those API endpoints in Postman =)!'));
app.post('/user/permissions', updatePermissions);
app.post('/user/authorise', authoriseUser);
app.get('/history', getHistoryLogs);
