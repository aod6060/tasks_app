/*
    This is were all of the controller will be placed in
*/
const model = require('./model')
const dayjs = require('dayjs')

model.init();

let view_need_refresh = false;
let is_refesh_reset = false;

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

function index_ajax(req, res) {
    model.TASK.get_all_tasks()
    .then((values) => {
        res.json(
            {
                values: values,
                levels: model.TASK.get_task_enum()
            }
        );
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

function index_apply_filter_ajax(req, res) {
    model.TASK.get_all_filtered_tasks(req.params.level, req.params.finished).then((tasks) => {
        res.json(
            {
                values: tasks,
                levels: model.TASK.get_task_enum()
            }
        );
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
        console.log(req.body.end_date);
        model.TASK.create_task(
            req.body.name,
            req.body.title,
            req.body.description,
            req.body.level,
            dayjs().format("YYYY-MM-DD"),
            req.body.end_date
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

            if(task == null) {
                res.redirect('/');
            } else {
                model.COMMENT.get_all_comments_from_TaskId(task.dataValues.id)
                .then((comments) => {
                    res.render('view_task', {task: task, comments: comments});
                });
            }
        });
    }
}

function view_task_ajax(req, res) {
    model.TASK.get_task_from_pk(req.params.id)
    .then((task) => {
        res.json({
            task: task
        })
    });
}

function view_task_ajax_comments(req, res) {
    model.COMMENT.get_all_comments_from_TaskId(req.params.id)
    .then((comments) => {
        res.json({
            comments: comments
        })
    });
}

function view_task_ajax_close(req, res) {
    model.TASK.update_task_finish(req.params.id, true)
    .then((value) => {
        view_need_refresh = true;
        res.send("");
    });
}

function view_task_ajax_open(req, res) {
    model.TASK.update_task_finish(req.params.id, false)
    .then((value) => {
        view_need_refresh = true;
        res.send("");
    });
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
    console.log("Hello, for output comment.");
    model.COMMENT.create_comment(req.body.name, req.body.message, req.params.id)
    .then((value) => {
        res.redirect(`/view/${req.params.id}`);
    });
}

function view_task_need_refresh(req, res) {
    let b = view_need_refresh;
    //view_need_refresh = false;
    if(!is_refesh_reset) {
        is_refesh_reset = true;
        setTimeout(() => {
            is_refesh_reset = false;
            view_need_refresh = false;
        }, 10000);
    }
    res.json({
        is_refresh: b
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
    model.TASK.update_task(req.params.id, req.body.name, req.body.title, req.body.description, req.body.level, req.body.end_date)
    .then((value) => {
        view_need_refresh = true;
        res.redirect(`/view/${req.params.id}`)
    });
}

/*
    Delete Task
*/
function delete_task(req, res) {
    model.TASK.get_task_from_pk(req.params.id)
    .then((task) => {
        view_need_refresh = true;
        res.render('delete_task', {task: task})
    })
}

function delete_task_post(req, res) {
    model.TASK.delete_task(req.params.id).
    then((value) => {
        res.redirect('/');
    })
    //res.redirect('/');
}

/*
    close_on_date_reached
*/
function close_on_date_reached(req, res) {
    model.TASK.get_all_tasks()
    .then(task => {
        for(let i = 0; i < task.length; i++) {
            let t = task[i];

            let current = dayjs();
            let endDate = dayjs(t.end_date);

            console.log(endDate.diff(current, "day"));

            if(endDate.diff(current, "day") < 1) {
                if(!t.dataValues.is_finished) {
                    model.TASK.update_task_finish(t.id, true).then((value) => {
                        console.log("Closed due to being out of date!");
                    });
                }
            }
        }
        res.send("");
    });
}

module.exports = {
    init: (app) => {
        // Handle roughts
        // Task List
        app.get('/', index);
        app.post('/index/filtered', index_filter);
        app.get('/index/filter/:level/:finished', index_apply_filter);
        app.get('/index/ajax', index_ajax);
        app.get('/index/ajax/filter/:level/:finished', index_apply_filter_ajax);
        // Create Task
        app.get('/create', create_task);
        app.get('/create/error/:message', create_task_error);
        app.post('/create', create_task_post);
        // View Task
        app.get('/view/:id', view_task);
        app.post('/view/:id/close', view_task_close);
        app.post('/view/:id/open', view_task_open);
        app.post('/view/:id/comment', view_task_post_comment);
        
        // View Task Ajax
        app.get('/view/ajax/:id', view_task_ajax);
        app.get('/view/ajax/:id/get/comment', view_task_ajax_comments);
        app.get('/view/ajax/:id/close', view_task_ajax_close);
        app.get('/view/ajax/:id/open', view_task_ajax_open);
        app.get('/view/ajax/:id/needrefresh', view_task_need_refresh);
        // Edit Task
        app.get('/edit/:id', edit_task);
        app.post('/edit/:id', edit_task_post);
        // Delete Task
        app.get('/delete/:id', delete_task);
        app.post('/delete/:id', delete_task_post);
        // Close on end date reached
        app.get('/enddatecheck', close_on_date_reached);
    }
};