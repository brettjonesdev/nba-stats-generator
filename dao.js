var mongoose = require ("mongoose");
var Schema = mongoose.Schema;

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/HelloMongoose';

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
    console.log("callback", err, res);
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});


// This is the schema.  Note the types, validation and trim
// statements.  They enforce useful constraints on the data.
var gameSchema = new mongoose.Schema({
    date: {type: Date},
    gameId: {type: String},
    teamId: {type: String},

    game: {type:Schema.Types.Mixed},
    homeGame: {type:Schema.Types.Mixed},
    teams: {type:Schema.Types.Mixed},
    us: {type:Schema.Types.Mixed},
    them: {type:Schema.Types.Mixed},
    fourFactors: {type:Schema.Types.Mixed},
    players: {type:Schema.Types.Mixed},
    spursIndex: {type:Schema.Types.Mixed},
    gameFlowData: {type:Schema.Types.Mixed}
});

//gameSchema.index({ date: 1, type: -1 });


//disable for prod
//gameSchema.set('autoIndex', false);

var GameModel = mongoose.model('Game', gameSchema);

/* clear existing game data
GameModel.remove().exec(function(err, results) {
    if (err) {
        console.log(err);
    } else {
        console.log("Deleted", results);
    }
});*/

var connectCallbacks = [];

module.exports = {
    getGames: function(options, callback, error) {
        GameModel.find(options).sort({date: 'ascending'}).exec(function(err, result) {
            if ( err )  {
                error(err);
            } else {
                callback(result);
            }
        })
    },
    saveGame: function (data, callback, error) {
        var game = new GameModel(data);
        game.save(function(err) {
            console.log("Saved game data for game " + data.gameId);
            if ( err ) {
                error(err);
            } else {
                callback(data);
            }
        });
    },
    remove: function(options) {
        return GameModel.remove(options).exec();
    },
    onConnect: function(callback) {
        connectCallbacks.push(callback);
    }
};