var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , elophant = 'p57T78ZVVS2mLWhndgeh'

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.post('/', function(req,res) {
  var data = ''

  req.on('data', function(chunk) {
      data += chunk.toString('utf8')
  })

  req.on('end', function() {
    var dataObj = JSON.parse(data)
      , options = {
          hostname: "api.elophant.com"
        , path: "/v2/na/"+dataObj.resource+"/"+dataObj.summonerName+"?key="+elophant
        , method: "GET"
        }
      , elophantCall = http.request(options, function(res) {
          var output = ''

          res.on('data', function (chunk) {
            output += chunk.toString('utf8')
          })

          res.on('end', function() {
            var players = []
              , options
              , elophantData
              , running=0

            output = JSON.parse(output)

            if ( output.success ) {
              elophantData = output.data.game

              elophantData.teamOne.forEach(function(player) {
                running++
                options = {
                  hostname: "api.elophant.com"
                , path: "/v2/na/player_stats/" + player.accountId + "?key=" + elophant
                , method: "GET"
                }

                http.request(options, function(res) {
                  var output = ''

                  res.on('data', function(chunk) {
                    output += chunk.toString('utf8')
                  })

                  res.on('end', function() {
                    output = JSON.parse(output)

                    output.data.playerStatSummaries.playerStatSummarySet.forEach(function(i) {
                      console.log(i)
                      if ( i.playerStatSummaryType === "RankedSolo5x5") {
                        players.push({
                          elo: i.rating
                        , name: player.summonerName
                        , team: 1
                        })
                      }
                    })

                    running--
                    if ( running === 0 ) {
                      statusRes(200, players)
                    }
                  })
                }).end()
              })

              elophantData.teamTwo.forEach(function(player) {
                running++
                options = {
                  hostname: "api.elophant.com"
                , path: "/v2/na/player_stats/" + player.accountId + "?key=" + elophant
                , method: "GET"
                }

                http.request(options, function(res) {
                  var output = ''

                  res.on('data', function(chunk) {
                    output += chunk.toString('utf8')
                  })

                  res.on('end', function() {
                    output = JSON.parse(output)

                    output.data.playerStatSummaries.playerStatSummarySet.forEach(function(i) {
                      if ( i.playerStatSummaryType === "RankedSolo5x5") {
                        players.push({
                          elo: i.rating
                        , name: player.summonerName
                        , team: 2
                        })
                      }
                    })

                    running--
                    if ( running === 0 ) {
                      statusRes(200, players)
                    }
                  })
                }).end()
              })
            }

            else statusRes(404)
          })

        }).on('error', function(e) {
          console.log('error' + e.message)
        })

        elophantCall.end()
  })

  function statusRes(code, data) {
    res.send(code, data)
  }
})

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
