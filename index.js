var express = require('express');
var app = express();
require('./apiExtensions');
var nba = require('nba');
var controller = require('./controller');

nba.ready(function() {
    nba.api.playersInfo({season: "2014-15"}).then( function (resp) {
        nba.playersInfo = resp;

        app.set('port', (process.env.PORT || 5000));
        app.use(express.static(__dirname + '/public'));

        app.get('/', controller.index);
        app.get('/team/averages/:name', controller.getSeasonAverages);
        app.get('/team/:name/:date', controller.getGameStats);
        app.get('/team/:name', controller.getGameStats);

        app.listen(app.get('port'), function() {
            console.log("Node app is running at localhost:" + app.get('port'));
        });
    });
});
