/*
    This is were all of the controller will be placed in
*/
const model = require('./model')
model.init();

function index(req, res) {
    res.send("Hello, World");
}

module.exports = {
    init: (app) => {
        // Handle roughts
        app.get('/', index);
    }
};