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

/*
    View Task
*/
function view_task(req, res) {
    if(typeof req.params.id == 'undefined') {
        res.redirect('/');
    } else {
        model.TASK.get_task_from_pk(req.params.id)
        .then((task) => {
            model.COMMENT.get_all_comments_from_TaskId(task.dataValues.id)
            .then((comments) => {
                res.render('view_task', {task: task, comments: comments});
            });
        });
    }
}

function view_task_close(req, res) {
    model.TASK.update_task_finish(req.params.id, true)
    .then((value) => {
        res.redirect(`/view/${req.params.id}`);
    });
}

function view_task_open(req, res) {
    model.TASK.update_task_finish(req.params.id, false)
    .then((value) => {
        res.redirect(`/view/${req.params.id}`);
    })
}

function view_task_post_comment(req, res) {
    //res.redirect(`/view/${req.params.id}`);
    model.COMMENT.create_comment(req.body.name, req.body.message, req.params.id)
    .then((value) => {
        res.redirect(`/view/${req.params.id}`);
    });
}


/*
    Edit Task
*/
function edit_task(req, res) {
    model.TASK.get_task_from_pk(req.params.id)
    .then((task) => {
        res.render('edit_task', {task: task, levels: model.TASK.get_task_enum()})
    });
}

function edit_task_post(req, res) {
    model.TASK.update_task(req.params.id, req.body.name, req.body.title, req.body.description, req.body.level)
    .then((value) => {
        res.redirect(`/view/${req.params.id}`)
    });
}

module.exports = {
    init: (app) => {
        // Handle roughts
        // Task List
        app.get('/', index);
        app.post('/index/filtered', index_filter);
        app.get('/index/filter/:level/:finished', index_apply_filter);
        // Create Task
        app.get('/create', create_task);
        app.get('/create/error/:message', create_task_error);
        app.post('/create', create_task_post);
        // View Task
        app.get('/view/:id', view_task);
        app.post('/view/:id/close', view_task_close);
        app.post('/view/:id/open', view_task_open);
        app.post('/view/:id/comment', view_task_post_comment);
        // Edit Task
        app.get('/edit/:id', edit_task);
        app.post('/edit/:id', edit_task_post);
    }
};