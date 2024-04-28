/*
    This is were all of the models will be placed in.
*/
const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize("sqlite:database.db");

let dev = false;

// Tasks has a one to one relationship with TaskLevel
// Task has a one to many relationship with 
const Task = sequelize.define(
    'Task',
    {
        title: {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        },
        level: {
            type: DataTypes.ENUM('NORMAL', 'PRIORITY', 'IMMEDIATE')
        },
        is_finished: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }
);

const Comment = sequelize.define(
    'Comment',
    {
        name: {
            type: DataTypes.STRING
        },
        message: {
            type: DataTypes.TEXT
        }
    }
);

async function init_database() {
    if(dev) {
        await Task.drop();
        await Comment.drop();
        await Task.hasMany(Comment);
        await Comment.belongsTo(Task);
        await Task.sync();
        await Comment.sync();

        let temp = await Task.create(
            {
                title: "SQL Test",
                name: "Dan",
                description: "This needs to be handled through out the project.",
                level: Task.getAttributes().level.values[0]
            }
        );
        await temp.save();

        let temp2 = await Comment.create(
            {
                name: "Chris",
                message: "Throught the project???",
                TaskId: temp.dataValues.id
            }
        );
        temp2.save();

        temp = await Task.create(
            {
                title: "Web Test",
                name: "Fred",
                description: "This needs to be handled by the end of the week.",
                level: Task.getAttributes().level.values[1],
                is_finished: true
            }
        );

        await temp.save();

        temp2 = await Comment.create(
            {
                name: "Chris",
                message: "Why does does this task need to be handled by the end of the week???",
                TaskId: temp.dataValues.id
            }
        );
        temp2.save();

        temp2 = await Comment.create(
            {
                name: "Dan",
                message: "Just because. Get it done!!!",
                TaskId: temp.dataValues.id
            }
        );
        temp2.save();

        temp = await Task.create(
            {
                title: "System Down",
                name: "Chris",
                description: "The system went down. We need this handle asap!",
                level: Task.getAttributes().level.values[2]
            }
        );
        
        await temp.save();

        temp2 = await Comment.create(
            {
                name: "Chris",
                message: "What is going one!!!",
                TaskId: temp.dataValues.id
            }
        );
        temp2.save();
    }
}

// This will just contain all of the models.
module.exports = {
    init: () => {
        init_database();
    },
    TASK: {
        get_task_enum: () => {
            return Task.getAttributes().level.values;
        },
        get_all_tasks: async () => {
            return await Task.findAll();
        },
        get_all_filtered_tasks: async (level, finished) => {
            filter = {};

            if(level != "ALL") {
                filter["level"] = level;
            }

            if(finished != "ALL") {
                if(finished == "WORKING") {
                    filter["is_finished"] = false;
                } else if(finished == "DONE") {
                    filter["is_finished"] = true;
                }
            }

            console.log(filter);


            if(typeof filter["level"] != "undefined" && typeof filter["is_finished"] != "undefined") {
                return await Task.findAll({
                    where: {
                        level: filter["level"],
                        is_finished: filter["is_finished"],
                    }
                });
            } else if(typeof filter["level"] != "undefined" && typeof filter["is_finished"] == "undefined") {
                return await Task.findAll({
                    where: {
                        level: filter["level"],
                    }
                });
            } else if(typeof filter["level"] == "undefined" && typeof filter["is_finished"] != "undefined") {
                return await Task.findAll({
                    where: {
                        is_finished: filter["is_finished"],
                    }
                });
            } else {
                return await Task.findAll();
            }
        },
        get_task_from_pk: async (id) => {
            return await Task.findByPk(id);
        },
        create_task: async (name, title, description, level) => {
            let temp = await Task.create({
                name: name,
                title: title,
                description: description,
                level: level
            });
            return await temp.save();
        },
        update_task_finish: async (id, is_finished) => {
            let temp = await Task.findByPk(id)
            await temp.update({
                is_finished: is_finished
            });
            return await temp.save();
        },
        update_task: async (id, name, title, description, level) => {
            let temp = await Task.findByPk(id);
            await temp.update({
                name: name,
                title: title,
                description: description,
                level: level
            });
            return await temp.save();
        }
    },
    COMMENT: {
        get_all_comments_from_TaskId: async (id) => {
            return await Comment.findAll({
                where: {
                    TaskId: id
                }
            });
        },
        create_comment: async (name, message, TaskId) => {
            let temp = await Comment.create({
                name: name,
                message: message,
                TaskId: TaskId
            });
            return await temp.save();
        }
    }
};