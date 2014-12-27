#! /app/bin/node
var nba = require('nba');
var _ = require('underscore');
var moment = require('moment');
var Promise = require( "es6-promise" ).Promise;
var service = require('./service');
var sleep = require('sleep');


function generate(start, end) {
    start = moment(start);
    end = moment(end);
    if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
        throw "Please enter valid start and end dates";
    }
    var date = moment(start);

    function callback() {
        console.log("completed day " + moment(date).format("MM/DD/YYYY"));
        sleep.sleep(2);
        date = moment(date).add(1, 'days');
        if (moment(date).isAfter(end) || moment(date).isAfter(moment())) {
            console.log("Generated data for all games between " + moment(start).format("MM/DD/YYYY") + ' and ' + moment(end).format('MM/DD/YYYY'));
            process.exit(0);
        } else {
            getGamesDataForDate(date)
        }
    }

    getGamesDataForDate(date, callback, function(e) {console.log(e);});
}



function getGamesDataForDate(date, callback, error) {
    getGamesForDate(date.toDate(), function(games) {
        if( games && games.length ) {
            var promisesForGames = [];
            _.each(games, function(game) {
                console.log("Game " + game.gAMECODE);
                if ( game.gameStatusId == global.GAME_STATUS_FINAL) {
                    var homeTeam = _.findWhere(nba.teamsInfo, {teamId: game.homeTeamId});
                    var visitorTeam = _.findWhere(nba.teamsInfo, {teamId: game.visitorTeamId});

                    promisesForGames.push(service.getGameStatsFromApi(game, homeTeam, date));
                    promisesForGames.push(service.getGameStatsFromApi(game, visitorTeam, date));
                }
            });
            Promise.all(promisesForGames).then(callback, error);
        } else {
            callback();
        }
    })
}

function getGamesForDate(date, callback, error) {
    nba.api.scoreboard({ GameDate: moment(date).format('MM/DD/YYYY') }).then(function(resp) {
        callback(resp.gameHeader);
    }).catch(error);
}

process.on('uncaughtException', function (error) {
    console.log(error);
});


var argLength = process.argv.length;
if ( argLength == 4 ) {
    var start = process.argv[2];
    var end = process.argv[3];
    nba.ready(function() {
        generate(start, end);
    });

} else {
    console.log("Please enter a start and end date in format MM-DD-YYYY");
    process.exit(1);
}
if (argLength < 4 ) {
    console.log("Please pass a start and end datename.  For instance 'Spurs'");
    throw "error";
}