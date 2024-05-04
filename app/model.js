/*
    This is were all of the models will be placed in.
*/
const { Sequelize, DataTypes, DATEONLY, Model } = require('sequelize')
const dayjs = require('dayjs')
const crypto = require('crypto');

const sequelize = new Sequelize("sqlite:database.db");

// This should be changed if you want to use this application
const salt = "taskit";
//let md5 = crypto.createHmac("md5", salt);

let dev = true;


function toMD5String(str) {
    let m = crypto.createHmac("md5", salt);
    return m.update(str).digest("hex");
}

// Tasks has a one to one relationship with TaskLevel
// Task has a one to many relationship with 
const Task = sequelize.define(
    'Task',
    {
        title: {
            type: DataTypes.STRING,
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
        },
        start_date: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        end_date: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        }
    },
    {timestamps: false}
);

const Comment = sequelize.define(
    'Comment',
    {
        message: {
            type: DataTypes.TEXT
        }
    },
    {timestamps: false}
);

const Account = sequelize.define(
    'Account',
    {
        username: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING
        },
        permission: {
            type: DataTypes.ENUM("EMPLOYEE", "MANAGER", "ADMIN")
        }
    },
    {timestamps: false}
);

const Session = sequelize.define(
    'Session',
    {
        status: DataTypes.ENUM("LOGIN", "LOGOUT"),
        log_date: DataTypes.DATE,
    },
    {timestamps: false}
);



async function init_database() {
    if(dev) {
        await Task.drop();
        await Comment.drop();
        await Session.drop();
        await Account.drop();
    }
    await Task.hasMany(Comment);
    await Comment.belongsTo(Task);
    // Account Relationships
    // Setup Relationships for Task
    await Account.hasMany(Task);
    await Task.belongsTo(Account);
    // Setup Relationships for Comments
    await Account.hasMany(Comment);
    await Comment.belongsTo(Account);
    // Changed my mind Accounts have man sessions
    await Account.hasMany(Session);
    await Session.belongsTo(Account);

    await Task.sync();
    await Comment.sync();
    await Account.sync();
    await Session.sync();

    if(dev) {
        let current = dayjs();

        console.log(toMD5String("pass"));

        // Fred 1
        let account = await Account.create({
            username: "Fred",
            password: toMD5String("pass"),
            permission: Account.getAttributes().permission.values[2]
        });
        await account.save();

        // Dan 2
        account = await Account.create({
            username: "Dan",
            password: toMD5String("pass"),
            permission: Account.getAttributes().permission.values[1]
        });
        await account.save();

        // Chris 3
        account = await Account.create({
            username: "Chris",
            password: toMD5String("pass"),
            permission: Account.getAttributes().permission.values[0]
        });
        await account.save();

        let temp = await Task.create(
            {
                title: "SQL Test",
                description: "This needs to be handled through out the project.",
                level: Task.getAttributes().level.values[0],
                start_date: current.format("YYYY-MM-DD"),
                end_date: current.add(30, "day").format("YYYY-MM-DD"),
                AccountId: 2
            }
        );
        await temp.save();

        let temp2 = await Comment.create(
            {
                message: "Throught the project???",
                TaskId: temp.dataValues.id,
                AccountId: 3
            }
        );
        temp2.save();

        temp = await Task.create(
            {
                title: "Web Test",
                description: "This needs to be handled by the end of the week.",
                level: Task.getAttributes().level.values[1],
                is_finished: true,
                start_date: current.format("YYYY-MM-DD"),
                end_date: current.add(15, "day").format("YYYY-MM-DD"),
                AccountId: 1
            }
        );

        await temp.save();

        temp2 = await Comment.create(
            {
                message: "Why does does this task need to be handled by the end of the week???",
                TaskId: temp.dataValues.id,
                AccountId: 3
            }
        );
        temp2.save();

        temp2 = await Comment.create(
            {
                message: "Just because. Get it done!!!",
                TaskId: temp.dataValues.id,
                AccountId: 1
            }
        );
        temp2.save();

        temp = await Task.create(
            {
                title: "System Down",
                description: "The system went down. We need this handle asap!",
                level: Task.getAttributes().level.values[2],
                start_date: current.format("YYYY-MM-DD"),
                end_date: current.add(5, "day").format("YYYY-MM-DD"),
                AccountId: 1
            }
        );
        
        await temp.save();

        temp2 = await Comment.create(
            {
                message: "What is going one!!!",
                TaskId: temp.dataValues.id,
                AccountId: 3
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
        create_task: async (title, description, level, start_date, end_date, accountid) => {
            let temp = await Task.create({
                title: title,
                description: description,
                level: level,
                start_date: start_date,
                end_date: end_date,
                AccountId: accountid
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
        update_task: async (id, title, description, level, end_date) => {
            let temp = await Task.findByPk(id);
            await temp.update({
                title: title,
                description: description,
                level: level,
                end_date: end_date
            });
            return await temp.save();
        },
        delete_task: async(id) => {
            let task = await Task.findByPk(id);
            //await this.COMMENT.delete_comments(id);
            let comments = await Comment.findAll({
                where: {
                    TaskId: id
                }
            });
            for(let i = 0; i < comments.length; i++) {
                c = comments[i];
                await c.destroy();
            }
            return await task.destroy();
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
        create_comment: async (message, TaskId, AccountId) => {
            console.log(`message=${message}, TaskId=${TaskId}`)
            let temp = await Comment.create({
                message: message,
                TaskId: TaskId,
                AccountId: AccountId
            });

            console.log(temp);

            return await temp.save();
        }
    },
    ACCOUNT: {
        get_account_permision_enum: () => {
            return Account.getAttributes().permission.values;
        },
        get_all_accounts: async () => {
            return await Account.findAll()
        }
    },
    encrypte_string: (str) => {
        return toMD5String(str);
    }
};