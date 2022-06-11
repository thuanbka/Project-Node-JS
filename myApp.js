require('dotenv').config();
var mongoose = require("mongoose");

if (process.env.MONGO_URI) {
    console.log(process.env.MONGO_URI);
    mongoose.connect(process.env.MONGO_URI);
} else {
    console.log("Can't get link URI mongoose.")
}

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
    done(null /*, data*/ );
};

const findOneByFood = (food, done) => {
    done(null /*, data*/ );
};

const findPersonById = (personId, done) => {
    done(null /*, data*/ );
};

const findEditThenSave = (personId, done) => {
    const foodToAdd = "hamburger";

    done(null /*, data*/ );
};

const findAndUpdate = (personName, done) => {
    const ageToSet = 20;

    done(null /*, data*/ );
};

const removeById = (personId, done) => {
    done(null /*, data*/ );
};

const removeManyPeople = (done) => {
    const nameToRemove = "Mary";

    done(null /*, data*/ );
};

const queryChain = (done) => {
    const foodToSearch = "burrito";

    done(null /*, data*/ );
};


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