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
    res.render('create_task', {levels: model.TASK.get_task_enum()});
}

function create_task_error(req, res) {
    res.render('create_task', {levels: model.TASK.get_task_enum(), error: req.params.message});
}

function create_task_post(req, res) {
    if(req.body.name == "") {
        let message = "Name can't not be empty!";
        res.redirect(`/create/error/${message}`);
    }
    else if(req.body.title == "") {
        let message = "Title can't not be empty!";
        res.redirect(`/create/error/${message}`);
    } else if(req.body.description == "") {
        let message = "Description can't not be empty!";
        res.redirect(`/create/error/${message}`);
    } else {
        model.TASK.create_task(
            req.body.name,
            req.body.title,
            req.body.description,
            req.body.level
        )
        .then((value)=> {
            res.redirect('/');
        });
        //res.redirect('/');
    }
    //res.redirect('/');
}

module.exports = {
    init: (app) => {
        // Handle roughts
        // Index Page
        app.get('/', index);
        app.post('/index/filtered', index_filter);
        app.get('/index/filter/:level/:finished', index_apply_filter);
        // Create Page
        app.get('/create', create_task);
        app.get('/create/error/:message', create_task_error);
        app.post('/create', create_task_post);
    }
};