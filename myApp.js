require('dotenv').config();
var mongoose = require("mongoose");

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

const Person = mongoose.model("Person", personSchema);

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
    console.log(data.upfile);
    console.log(object);
    if (object.name == null && object.type == null && object.size == null) {
        return "Please upload a file!!!"
    }
    return object;
}

exports.PersonModel = Person;
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