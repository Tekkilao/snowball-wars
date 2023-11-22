const express = require('express');

const app = express();

const port = 5000;


app.listen(port, () => {
    date = new Date()
    console.log(`Server Started on port ${port} at ${date}`);
});