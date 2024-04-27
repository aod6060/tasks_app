/*
    This is were all of the controller will be placed in
*/
const model = require('./model')
model.init();

/*
    Handling index section
*/
function index(req, res) {
    //res.send("Hello, World");
    //res.render('index');
    model.TASK.get_all_tasks().then((values) => {
        res.render('index', {values: values, levels: model.TASK.get_task_enum()});
    });
}

function index_filter(req, res) {

    console.log(req.params);
    console.log(req.body);

    if(req.body.level == "ALL" && req.body.finished == "ALL") {
        res.redirect('/');
    } else {
        res.redirect(`/index/filter/${req.body.level}/${req.body.finished}`);
    }
}

function index_apply_filter(req, res) {
    model.TASK.get_all_filtered_tasks(req.params.level, req.params.finished).then((values) => {
        res.render('index', {values: values, levels: model.TASK.get_task_enum()});
    });
}

/*
    Creating task
*/
function create_task(req, res) {

}

function create_task_error(req, res) {

}

function create_task_pos(req, res) {

}

module.exports = {
    init: (app) => {
        // Handle roughts
        app.get('/', index);
        app.post('/index/filtered', index_filter);
        app.get('/index/filter/:level/:finished', index_apply_filter);
    }
};