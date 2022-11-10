const express = require("express");
const app = express();
let mongoose;
try {
    mongoose = require("mongoose");
} catch (e) {
    console.log(e);
}
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const router = express.Router();
let formidable = require('formidable');

const enableCORS = function(req, res, next) {
    if (!process.env.DISABLE_XORIGIN) {
        const allowedOrigins = ["https://www.freecodecamp.org"];
        const origin = req.headers.origin;
        if (!process.env.XORIGIN_RESTRICT || allowedOrigins.indexOf(origin) > -1) {
            res.set({
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
            });
        }
    }
    next();
};

var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));

const TIMEOUT = 10000;

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "../views", "home.html"));
});

app.use("/public", express.static(path.join(__dirname, '../public')));

app.route('/home')
    .get(function(req, res) {
        res.sendFile(process.cwd() + '/views/home.html');
    });

app.route('/exercise_tracker')
    .get(function(req, res) {
        res.sendFile(process.cwd() + '/views/exercise_tracker.html');
    });

app.route('/url_shortener')
    .get(function(req, res) {
        res.sendFile(process.cwd() + '/views/url_shortener.html');
    });

app.route('/demo_upload')
    .get(function(req, res) {
        res.sendFile(process.cwd() + '/views/page_upload.html');
    });

router.get("/file/*?", function(req, res, next) {
    if (req.params[0] === ".env") {
        return next({ status: 401, message: "ACCESS DENIED" });
    }
    fs.readFile(path.join(__dirname, req.params[0]), function(err, data) {
        if (err) {
            return next(err);
        }
        res.type("txt").send(data.toString());
    });
});

router.get("/is-mongoose-ok", function(req, res) {
    if (mongoose) {
        res.json({ isMongooseOk: !!mongoose.connection.readyState });
    } else {
        res.json({ isMongooseOk: false });
    }
});

const Person = require("./myApp.js").PersonModel;
const URLModel = require("./myApp.js").URLSHORTModel;
const User = require("./myApp.js").UserModel;
const Exercise = require("./myApp.js").ExerciseModel;

router.use(function(req, res, next) {
    if (req.method !== "OPTIONS" && Person.modelName !== "Person") {
        return next({ message: "Person Model is not correct" });
    }
    next();
});

router.post("/mongoose-model", function(req, res, next) {
    // try to create a new instance based on their model
    // verify it's correctly defined in some way
    let object;
    object = {
        "person": new Person(req.body),
        "url_short_cur": new URLModel(req.body),
        "user": new User(req.body),
        "exercise": new Exercise(req.body),
    }
    res.json(object);
});

const createPerson = require("./myApp.js").createAndSavePerson;
router.get("/create-and-save-person", function(req, res, next) {
    // in case of incorrect function use wait timeout then respond
    let t = setTimeout(() => {
        next({ message: "timeout" });
    }, TIMEOUT);
    createPerson(function(err, data) {
        clearTimeout(t);
        if (err) {
            return next(err);
        }
        if (!data) {
            console.log("Missing `done()` argument");
            return next({ message: "Missing callback argument" });
        }
        Person.findById(data._id, function(err, pers) {
            if (err) {
                return next(err);
            }
            res.json(pers);
            pers.remove();
        });
    });
});

const createPeople = require("./myApp.js").createManyPeople;
router.post("/create-many-people", function(req, res, next) {
    Person.remove({}, function(err) {
        if (err) {
            return next(err);
        }
        // in case of incorrect function use wait timeout then respond
        let t = setTimeout(() => {
            next({ message: "timeout" });
        }, TIMEOUT);
        createPeople(req.body, function(err, data) {
            clearTimeout(t);
            if (err) {
                return next(err);
            }
            if (!data) {
                console.log("Missing `done()` argument");
                return next({ message: "Missing callback argument" });
            }
            Person.find({}, function(err, pers) {
                if (err) {
                    return next(err);
                }
                res.json(pers);
                Person.remove().exec();
            });
        });
    });
});

const findByName = require("./myApp.js").findPeopleByName;
router.post("/find-all-by-name", function(req, res, next) {
    let t = setTimeout(() => {
        next({ message: "timeout" });
    }, TIMEOUT);
    Person.create(req.body, function(err, pers) {
        if (err) {
            return next(err);
        }
        findByName(pers.name, function(err, data) {
            clearTimeout(t);
            if (err) {
                return next(err);
            }
            if (!data) {
                console.log("Missing `done()` argument");
                return next({ message: "Missing callback argument" });
            }
            res.json(data);
            Person.remove().exec();
        });
    });
});

const findByFood = require("./myApp.js").findOneByFood;
router.post("/find-one-by-food", function(req, res, next) {
    let t = setTimeout(() => {
        next({ message: "timeout" });
    }, TIMEOUT);
    let p = new Person(req.body);
    p.save(function(err, pers) {
        if (err) {
            return next(err);
        }
        findByFood(pers.favoriteFoods[0], function(err, data) {
            clearTimeout(t);
            if (err) {
                return next(err);
            }
            if (!data) {
                console.log("Missing `done()` argument");
                return next({ message: "Missing callback argument" });
            }
            res.json(data);
            p.remove();
        });
    });
});

const findById = require("./myApp.js").findPersonById;
router.get("/find-by-id", function(req, res, next) {
    let t = setTimeout(() => {
        next({ message: "timeout" });
    }, TIMEOUT);
    let p = new Person({ name: "test", age: 0, favoriteFoods: ["none"] });
    p.save(function(err, pers) {
        if (err) {
            return next(err);
        }
        findById(pers._id, function(err, data) {
            clearTimeout(t);
            if (err) {
                return next(err);
            }
            if (!data) {
                console.log("Missing `done()` argument");
                return next({ message: "Missing callback argument" });
            }
            res.json(data);
            p.remove();
        });
    });
});

const findEdit = require("./myApp.js").findEditThenSave;
router.post("/find-edit-save", function(req, res, next) {
    let t = setTimeout(() => {
        next({ message: "timeout" });
    }, TIMEOUT);
    let p = new Person(req.body);
    p.save(function(err, pers) {
        if (err) {
            return next(err);
        }
        try {
            findEdit(pers._id, function(err, data) {
                clearTimeout(t);
                if (err) {
                    return next(err);
                }
                if (!data) {
                    console.log("Missing `done()` argument");
                    return next({ message: "Missing callback argument" });
                }
                res.json(data);
                p.remove();
            });
        } catch (e) {
            console.log(e);
            return next(e);
        }
    });
});

const update = require("./myApp.js").findAndUpdate;
router.post("/find-one-update", function(req, res, next) {
    let t = setTimeout(() => {
        next({ message: "timeout" });
    }, TIMEOUT);
    let p = new Person(req.body);
    p.save(function(err, pers) {
        if (err) {
            return next(err);
        }
        try {
            update(pers.name, function(err, data) {
                clearTimeout(t);
                if (err) {
                    return next(err);
                }
                if (!data) {
                    console.log("Missing `done()` argument");
                    return next({ message: "Missing callback argument" });
                }
                res.json(data);
                p.remove();
            });
        } catch (e) {
            console.log(e);
            return next(e);
        }
    });
});

const removeOne = require("./myApp.js").removeById;
router.post("/remove-one-person", function(req, res, next) {
    Person.remove({}, function(err) {
        if (err) {
            return next(err);
        }
        let t = setTimeout(() => {
            next({ message: "timeout" });
        }, TIMEOUT);
        let p = new Person(req.body);
        p.save(function(err, pers) {
            if (err) {
                return next(err);
            }
            try {
                removeOne(pers._id, function(err, data) {
                    clearTimeout(t);
                    if (err) {
                        return next(err);
                    }
                    if (!data) {
                        console.log("Missing `done()` argument");
                        return next({ message: "Missing callback argument" });
                    }
                    console.log(data);
                    Person.count(function(err, cnt) {
                        if (err) {
                            return next(err);
                        }
                        data = data.toObject();
                        data.count = cnt;
                        console.log(data);
                        res.json(data);
                    });
                });
            } catch (e) {
                console.log(e);
                return next(e);
            }
        });
    });
});

const removeMany = require("./myApp.js").removeManyPeople;
router.post("/remove-many-people", function(req, res, next) {
    Person.remove({}, function(err) {
        if (err) {
            return next(err);
        }
        let t = setTimeout(() => {
            next({ message: "timeout" });
        }, TIMEOUT);
        Person.create(req.body, function(err, pers) {
            if (err) {
                return next(err);
            }
            try {
                removeMany(function(err, data) {
                    clearTimeout(t);
                    if (err) {
                        return next(err);
                    }
                    if (!data) {
                        console.log("Missing `done()` argument");
                        return next({ message: "Missing callback argument" });
                    }
                    Person.count(function(err, cnt) {
                        if (err) {
                            return next(err);
                        }
                        if (data.ok === undefined) {
                            // for mongoose v4
                            try {
                                data = JSON.parse(data);
                            } catch (e) {
                                console.log(e);
                                return next(e);
                            }
                        }
                        res.json({
                            n: data.n,
                            count: cnt,
                            ok: data.ok,
                        });
                    });
                });
            } catch (e) {
                console.log(e);
                return next(e);
            }
        });
    });
});

const chain = require("./myApp.js").queryChain;
router.post("/query-tools", function(req, res, next) {
    let t = setTimeout(() => {
        next({ message: "timeout" });
    }, TIMEOUT);
    Person.remove({}, function(err) {
        if (err) {
            return next(err);
        }
        Person.create(req.body, function(err, pers) {
            if (err) {
                return next(err);
            }
            try {
                chain(function(err, data) {
                    clearTimeout(t);
                    if (err) {
                        return next(err);
                    }
                    if (!data) {
                        console.log("Missing `done()` argument");
                        return next({ message: "Missing callback argument" });
                    }
                    res.json(data);
                });
            } catch (e) {
                console.log(e);
                return next(e);
            }
        });
    });
});

const getInfoHeader = require("./myApp.js").getInfoHeader;
app.get("/api/whoami", function(req, res) {
    return res.json(getInfoHeader(req));
});


const formatDate = require("./myApp.js").formatDate;
app.get("/api/:date?", function(req, res) {
    return res.json(formatDate(req.params.date));
});


const analysFile = require("./myApp.js").analysFile;
app.post("/demo_upload/api/fileanalyse", function(req, res) {

    let form = new formidable.IncomingForm();
    form.parse(req, function(error, fields, file) {
        return res.json(analysFile(file));
    });
});

const createShortURL = require("./myApp.js").createAndSaveShortURL;
app.post("/url_shortener/api/shorturl", function(req, res, next) {
    // in case of incorrect function use wait timeout then respond
    let t = setTimeout(() => {
        next({ message: "timeout" });
    }, TIMEOUT);
    createShortURL(req.body, function(err, data) {
        clearTimeout(t);
        if (err) {
            return next(err);
        }
        if (!data) {
            console.log("Missing `done()` argument");
            return next({ message: "Missing callback argument" });
        }
        return res.json(data);
    });
});

const getURLFromShort = require("./myApp.js").getURLFromShort;
app.get("/url_shortener/api/shorturl/:short_url?", function(req, res, next) {
    let t = setTimeout(() => {
        next({ message: "timeout" });
    }, TIMEOUT);
    getURLFromShort(req.params.short_url, function(err, data) {
        clearTimeout(t);
        if (err) {
            return next(err);
        }
        if (!data) {
            console.log("Missing `done()` argument");
            return next({ message: "Missing callback argument" });
        }
        if (data.original_url) {
            res.redirect(data.original_url);
        } else {
            return res.json(data);
        }
    });
});

const createExercise = require("./myApp.js").createExercise;
app.post("/exercise_tracker/api/users/:id/exercises", function(req, res, next) {
    let t = setTimeout(() => {
        next({ message: "timeout" });
    }, TIMEOUT);
    createExercise(req, function(err, data) {
        clearTimeout(t);
        if (err) {
            return next(err);
        }
        if (!data) {
            console.log("Missing `done()` argument");
            return next({ message: "Missing callback argument" });
        }
        return res.json(data);
    });
});

const createUser = require("./myApp.js").createUser;
app.post("/exercise_tracker/api/users/", function(req, res, next) {
    let t = setTimeout(() => {
        next({ message: "timeout" });
    }, TIMEOUT);
    createUser(req.body.username, function(err, data) {
        clearTimeout(t);
        if (err) {
            return next(err);
        }
        if (!data) {
            console.log("Missing `done()` argument");
            return next({ message: "Missing callback argument" });
        } else {
            return res.json(data);
        }
    });
});

const getListUsers = require("./myApp.js").getListUsers;
app.get("/exercise_tracker/api/users/", function(req, res, next) {
    let t = setTimeout(() => {
        next({ message: "timeout" });
    }, TIMEOUT);
    getListUsers(function(err, data) {
        clearTimeout(t);
        if (err) {
            return next(err);
        }
        if (!data) {
            console.log("Missing `done()` argument");
            return next({ message: "Missing callback argument" });
        } else {
            return res.json(data);
        }
    });
});

const getListLogsUser = require("./myApp.js").getListLogsUser;
app.get("/exercise_tracker/api/users/:id/logs/", function(req, res, next) {
    let t = setTimeout(() => {
        next({ message: "timeout" });
    }, TIMEOUT);
    getListLogsUser(req, function(err, data) {
        clearTimeout(t);
        if (err) {
            return next(err);
        }
        if (!data) {
            console.log("Missing `done()` argument");
            return next({ message: "Missing callback argument" });
        } else {
            return res.json(data);
        }
    });
});



app.use("/_api", enableCORS, router);

// Error handler
app.use(function(err, req, res, next) {
    if (err) {
        res
            .status(err.status || 500)
            .type("txt")
            .send(err.message || "SERVER ERROR");
    }
});

// Unmatched routes handler
app.use(function(req, res) {
    if (req.method.toLowerCase() === "options") {
        res.end();
    } else {
        res.status(404).type("txt").send("404-Not Found");
    }
});

const listener = app.listen(process.env.PORT || 8000, function() {
    console.log("Your app is listening on port " + listener.address().port);
});