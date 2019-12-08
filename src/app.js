const express = require('express');
const app = express();
const port = 3000;

// REST API ROUTES
app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Sesame can only open when you are listening on port ${port}!`));
