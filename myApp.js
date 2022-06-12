require('dotenv').config();
var mongoose = require("mongoose");
const dns = require('dns');
const { error } = require('console');
if (process.env.MONGO_URI) {
    console.log(process.env.MONGO_URI);
    mongoose.connect(process.env.MONGO_URI);
} else {
    console.log("Can't get link URI mongoose.")
}

const fullNameDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const shortNameDays = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
const fullNamemonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const shortNamemonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const Schema = mongoose.Schema;

const personSchema = new Schema({
    name: String,
    age: Number,
    favoriteFoods: [String]
});

const urlSchema = new Schema({
    "original_url": String,
    "short_url": String
});

const userSchema = new Schema({
    "username": String
});

const ExerciseSchema = new Schema({
    "idUser": { type: String, required: true },
    "description": { type: String, required: true },
    "duration": { type: Number, required: true },
    "date": { type: Number, required: true },
});

const Person = mongoose.model("Person", personSchema);
const URLModel = mongoose.model("Url", urlSchema);
const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", ExerciseSchema);

const createAndSavePerson = (done) => {
    var person = new Person({ name: "thuan", age: 23, favoriteFoods: ["Hamberger", "Noodle"] });
    person.save(function(err, data) {
        if (err) {
            return console.err(err);
        } else {
            done(null, data);
        }
    });
};

const createManyPeople = (arrayOfPeople, done) => {
    Person.create(arrayOfPeople, function(err, data) {
        if (err) {
            return console.err(err);
        } else {
            done(null, data);
        }
    });
};

const findPeopleByName = (personName, done) => {
    Person.find({ name: personName }, function(err, data) {
        if (err) {
            return console.err(err);
        }
        done(null, data);
    });
};

const findOneByFood = (food, done) => {
    Person.findOne({ favoriteFoods: food }, function(err, data) {
        if (err) {
            return console.err(err);
        }
        done(null, data);
    });
};

const findPersonById = (personId, done) => {
    Person.findById(personId, function(err, data) {
        if (err) {
            return console.err(err);
        }
        done(null, data);
    });
};

const findEditThenSave = (personId, done) => {
    const foodToAdd = "hamburger";
    Person.findById(personId, function(err, person) {
        if (err) {
            return console.err(err);
        }
        person.favoriteFoods.push(foodToAdd);
        person.save(function(err, data) {
            if (err) {
                return console.err(err);
            } else {
                done(null, data);
            }
        });
    });
};

const findAndUpdate = (personName, done) => {
    const ageToSet = 20;

    Person.findOneAndUpdate({ name: personName }, { age: ageToSet }, { new: true }, function(err, data) {
        if (err) {
            return console.err(err);
        }
        done(null, data);
    });
};

const removeById = (personId, done) => {
    // Person.findByIdAndRemove(personId, function(err, data) {
    //     if (err) {
    //         return console.err(err);
    //     }
    //     done(null, data);
    // });

    Person.findOneAndRemove({ _id: personId }, function(err, data) {
        if (err) {
            return console.err(err);
        }
        done(null, data);
    });
};

const removeManyPeople = (done) => {
    const nameToRemove = "Mary";

    Person.remove({ name: nameToRemove }, function(err, data) {
        if (err) {
            return console.err(err);
        }
        done(null, data);
    });
};

const queryChain = (done) => {
    const foodToSearch = "burrito";

    Person.find({ favoriteFoods: foodToSearch })
        .sort({ name: 'asc' })
        .limit(2)
        .select({ age: 0 })
        .exec(function(err, data) {
            if (err) {
                return console.err(err);
            }
            done(null, data);
        });
};

const formatDate = (data_input) => {
    let time_utc = " 00:00:00 GMT";
    let date;
    if (data_input != null) {
        if (!isNaN(data_input)) {
            data_input = parseInt(data_input);
        }
        date = new Date(data_input);
    } else {
        date = new Date();
        time_utc = " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " GMT";
    }
    const unixTimestamp = Math.floor(date.getTime());

    if (isNaN(unixTimestamp)) {
        return { error: "Invalid Date" };
    }
    let dd = date.getDate();
    if (dd < 10) {
        dd = '0' + dd;
    }
    let utc = shortNameDays[date.getDay()] + ", " + dd + " " + shortNamemonths[date.getMonth()] + " " + date.getFullYear() + time_utc;
    var object = {
        "unix": unixTimestamp,
        "utc": utc
    }

    return object;
}

const getInfoHeader = (data) => {
    object = {
        "ipaddress": data.socket.localAddress,
        "language": data.get("Accept-Language"),
        "software": data.get('User-Agent')
    }
    return object;
}

const analysFile = (data) => {
    object = {
        "name": data.upfile.originalFilename,
        "type": data.upfile.mimetype,
        "size": data.upfile.size
    }
    if (object.name == null && object.type == null && object.size == null) {
        return "Please upload a file!!!"
    }
    return object;
}

const createAndSaveShortURL = (req, done) => {
    let url = req.url;
    let data;
    if (isUrlValid(url)) {
        let original_url = url.split("/")[2];
        const options = {
            all: true,
        };
        dns.lookup(original_url, options, (err, addresses) => {
            if (err) {
                data = { error: "Invalid Hostname" };
                done(null, data);
            } else {
                URLModel.find({ original_url: url }, function(err, data) {
                    if (err) {
                        done(null, err);
                    } else {
                        if (data.length > 0) {
                            done(null, data[0]);
                        } else {
                            urlModel = new URLModel({
                                "original_url": url,
                                "short_url": stringToHashConversion(url + new Date().toDateString())
                            });
                            urlModel.save(function(err, data) {
                                if (err) {
                                    return console.err(err);
                                } else {
                                    done(null, {
                                        "original_url": url,
                                        "short_url": urlModel.short_url
                                    });
                                }
                            });
                        }
                    }

                });
            }
        });
    } else {
        data = { error: 'invalid url' };
        done(null, data);
    }
};

const getURLFromShort = (short_url, done) => {
    URLModel.find({ short_url: short_url }, function(err, data) {
        if (err) {
            done(null, { "Err:": err });
        } else {
            if (data.length == 0) {
                return done(null, { "Not Found: ": short_url });
            } else {
                return done(null, data[0]);
            }
        }
    });
}

const createExercise = (req, done) => {
    let body = req.body;
    let id = req.params.id;
    let date = body.date;
    let duration = body.duration;
    if (date == null || date == "") {
        let d = new Date();
        let day = d.getDate();
        let month = d.getMonth() + 1;
        let year = d.getFullYear();
        date = new Date(year + "-" + month + "-" + day);
    } else {
        date = new Date(date);
    }

    date = date.getTime();
    if (isNaN(date)) {
        return done(null, { error: "Invalid Date" });
    }

    if (isNaN(duration)) {
        return done(null, { error: "Invalid Duration" });
    }

    User.findById(id, function(err, user) {
        if (err) {
            return console.err(err);
        } else {
            if (user) {
                let exerciseModel = new Exercise({
                    "idUser": id,
                    "description": body.description,
                    "duration": parseInt(duration),
                    "date": date
                });
                exerciseModel.save(function(err, exercise) {
                    if (err) {
                        return console.err(err);
                    } else {
                        let object = {
                            "username": user.username,
                            "duration": exercise.duration,
                            "description": exercise.description,
                            "date": changeTimeToFormat(exercise.date),
                            "_id": exercise.idUser
                        };
                        done(null, object);
                    }
                });
            } else {
                done(null, "Please enter an exact id!!!")
            }
        }
    });
}

const createUser = (username, done) => {

    if (username) {
        let user = new User({
            "username": username
        });
        user.save(function(err, data) {
            if (err) {
                return console.err(err);
            } else {
                done(null, data);
            }
        });
    } else {
        return done(null, "Please insert a username!!!");
    }
}

const getListUsers = (done) => {
    User.find({}, function(err, data) {
        if (err) {
            return console.err(err);
        } else {
            return done(null, data);
        }
    });
}

const getListLogsUser = (req, done) => {
    let id = req.params.id;
    let to = Number.MAX_VALUE;;
    let from = 0;
    if (req.query.to) {
        to = new Date(req.query.to).getTime();
    }
    if (req.query.from) {
        from = new Date(req.query.from).getTime();
    }
    let limit = parseInt(req.query.limit);

    User.findById(id, function(err, user) {
        if (err) {
            return console.err(err);
        } else {
            if (user) {
                Exercise.find({ idUser: id })
                    .where('date').gte(from).lte(to)
                    .limit(limit)
                    .exec(function(err, data) {
                        if (err) {
                            done(null, { "Err:": err });
                        } else {
                            let username = user.username;
                            let count = data.length;
                            let log = [];
                            for (let x of data) {
                                let object = {
                                    "description": x.description,
                                    "duration": x.duration,
                                    "date": changeTimeToFormat(x.date)
                                }
                                log.push(object);
                            }
                            let object = {
                                "username": username,
                                "count": count,
                                "_id": id,
                                "log": log
                            };
                            if (req.query.limit) {
                                object.limit = limit;
                            }
                            if (req.query.to) {
                                object.to = to;
                            }
                            if (req.query.from) {
                                object.from = from;
                            }
                            return done(null, object);
                        }
                    });
            } else {
                done(null, "No User Exist!!")
            }
        }
    });
}

function changeTimeToFormat(time) {
    let d = new Date(time);
    let day = d.getDate();
    if (day < 10) {
        day = '0' + day;
    }
    let year = d.getFullYear();
    return shortNameDays[d.getDay()] + " " + shortNamemonths[d.getMonth()] + " " + day + " " + year;
}

function isUrlValid(userInput) {
    var res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if (res == null) {
        return false;
    } else {
        return true;
    }
}

function stringToHashConversion(string) {
    var hashVal = 0;
    if (string.length == 0) return hashVal;
    for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        hashVal = ((hashVal << 5) - hashVal) + char;
        hashVal = hashVal & hashVal;
    }
    if (hashVal < 0) {
        hashVal = -hashVal;
    }
    return hashVal;
}



exports.PersonModel = Person;
exports.URLSHORTModel = URLModel;
exports.UserModel = User;
exports.ExerciseModel = Exercise;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
exports.formatDate = formatDate;
exports.getInfoHeader = getInfoHeader;
exports.analysFile = analysFile;
exports.createAndSaveShortURL = createAndSaveShortURL;
exports.getURLFromShort = getURLFromShort;
exports.createExercise = createExercise;
exports.createUser = createUser;
exports.getListUsers = getListUsers;
exports.getListLogsUser = getListLogsUser;