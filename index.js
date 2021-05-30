const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pg = require('pg');
const passport = require ('passport');
const schema = require (`./schema/schema`);
const {graphqlHTTP} = require('express-graphql'); 

const app = express();


// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use('/graphql',graphqlHTTP({graphiql: true, schema}));

/* 
app.use("/",require('./routes/accounts'))
app.use("/bookmark",require("./routes/bookmarks"))
app.use("/questions",require("./routes/questions")) */

app.listen(5000, ()=> {
    console.log(`App is running on port 5000`);
})