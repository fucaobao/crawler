var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var DAOSchema = new Schema({
    'time': String,
    'title': String,
    'href': String,
    'create_date': {
        'type': Date,
        'default': Date.now
    }
});
var zhihu = mongodb.mongoose.model("zhihu", DAOSchema);
var DAO = function() {};
DAO.prototype.save = function(obj, callback) {
    var instance = new zhihu(obj);
    instance.save(function(err) {
        callback(err);
    });
};
DAO.prototype.findByName = function(name, callback) {
    zhihu.findOne({
        name: name
    }, function(err, obj) {
        callback(err, obj);
    });
};
module.exports = new DAO();