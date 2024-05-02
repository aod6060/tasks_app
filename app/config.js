/*
    This is were all of nodes configuration will be placed in
*/
const express = require('express')
const session = require('express-session')

const app = express()
const port = 3000

const bodyParser = require('body-parser')
app.use(express.static('public'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.set('trush proxy', 1);
app.use(session({
    secret: 'TaskIT',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true}
}));

const controller = require('./controller');

module.exports = {
    init: () => {
        controller.init(app)
    },
    run: () => {
        app.listen(port, ()=>{
            console.log(`Application running on ${port}`);
        })
    }
};
