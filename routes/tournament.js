// const { all } = require(".");

var router = express.Router();
let TournamentRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  TournamentRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

  if (req.url == '/') 
    publishTournament({});
  else
    next('route');
});

router.get(`/list/running`, function(req, res, next) {
  TournamentRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  publishTournament({over: false});
});

router.get(`/list/notstarted`, function(req, res, next) {
  TournamentRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  publishTournament({started: false});
});

router.get(`/list/over`, function(req, res, next) {
  TournamentRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  publishTournament({over: true});
});

router.get(`/list/enabled`, function(req, res, next) {
  TournamentRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  publishTournament({enabled: true});
});

router.get(`/list/disabled`, function(req, res, next) {
  TournamentRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  publishTournament({enabled: false});
});

router.get(`/statusupdate/:tournamentName`, async function(req, res, next) {
  TournamentRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  var {tournamentName} = req.params;

  /* 
    update if tournament started / over flag
    1) Get tournament record.
    2) Get matches
    3) If no matches  started is FALSE and over is FALSE 
    4) if 1st match time < current time then started is TRUE 
    5) if last match end time < current time then over is true;
  */
  var tournamentRec = await Tournament.findOne({name: tournamentName});
  if (tournamentRec) {
    tournamentRec.started = false;
    tournamentRec.over = false;
    var myMatches = await CricapiMatch.find({tournament: tournamentName});
    if (myMatches.length > 0) {
      // if matche details are available then
      // console.log(myMatches);
      var currTime = new Date();
      // console.log(currTime);
      var matchTime = _.minBy(myMatches, 'matchStartTime') 
      // console.log(matchTime.matchStartTime);
      tournamentRec.started = (matchTime.matchStartTime < currTime);
      var matchTime = _.maxBy(myMatches, 'matchEndTime');
      // console.log(matchTime.matchEndTime);
      tournamentRec.over = (matchTime.matchEndTime < currTime);
    }
    // console.log(tournamentRec);
    tournamentRec.save();
    sendok("OK");
  } else
    senderr(741, `Invalid tournament name ${tournamentName}`);
});

router.get('/add/:tournamentName/:tournamentDesc/:tournamentType', async function(req, res, next) {
    TournamentRes = res;
    setHeader();
    if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

    var {tournamentName, tournamentDesc, tournamentType} = req.params;
    tournamentType = tournamentType.toUpperCase();
    if (!["TEST", "ODI", "T20"].includes(tournamentType)) {
      senderr(743, `Invalid tournament type ${tournamentType}. Has be be either TEST, ODI or T20`);
      return;
    }
    tournamentName = tournamentName.toUpperCase();
    var myrec = await Tournament.findOne({name: tournamentName});
    if (!myrec) {
        myrec = new Tournament();
        myrec.name = tournamentName;
        myrec.desc = tournamentDesc;
        myrec.type = tournamentType;
        myrec.over = false;
        myrec.save();
        sendok(`Successfully created tournament ${tournamentName}`);
    } else
        senderr(742,`Tournament ${tournamentName} already exists`);
});


router.use('/start/:tournamentName', function(req, res, next) {
    TournamentRes = res;
    setHeader();
    if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

    var {tournamentName} = req.params;
    sendTournamentStatus(tournamentName, false);
});

router.use('/end/:tournamentName', function(req, res, next) {
    TournamentRes = res;
    setHeader();
    if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

    var {tournamentName} = req.params;
    sendTournamentStatus(tournamentName, true);
});

router.use('/team/:tournamentName', function(req, res, next) {
    TournamentRes = res;
    setHeader();
    if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

    var {tournamentName} = req.params;
    tournamentName = tournamentName.toUpperCase();
    publish_teams({tournament: tournamentName});
});

async function getMatchDetails(tournamentName) {
  let allMatches = await CricapiMatch.find({tournament: tournamentName});
  // allMatches =  _.map(allMatches, o => _.pick(o, ['team1', 'team2', 'matchStartTime']));
  allMatches = _.sortBy(allMatches, 'matchStartTime');
  let myData=[]
  await allMatches.forEach(m => {
    myData.push({team1: m.team1, team2: m.team2, matchStartTime: cricDate(m.matchStartTime)});
  });
  return myData;
}


router.use('/tournament', async function(req, res, next) {
  TournamentRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  
  let startTime = new Date();
  startTime.setDate(startTime.getDate()-90);
  // console.log(startTime);

  //CricapiMatch.find({tournament: groupRec.tournament}).limit(1).sort({ "matchStartTime": 1 });
  let allTournament = await Tournament.find({enabled: true});
  let matchesOfTournament=[];
  for(i=0; i<allTournament.length; ++i) {
    let tournamentStatus = "";
    if (allTournament[i].started) {
      if (allTournament[i].over)
        tournamentStatus = "Complete";
      else
        tournamentStatus = "Running";
    } else
      tournamentStatus = "Upcoming"
    let firstMatch = await CricapiMatch.find({tournament: allTournament[i].name}).limit(1).sort({ "matchStartTime": 1 });
    // if (allTournament[i].name === "IPL2020") console.log(firstMatch);
    if (firstMatch.length > 0) {
      let diffTime = firstMatch[0].matchStartTime.getTime() - startTime.getTime();
      if (diffTime > 0) {
        let myMatches = await getMatchDetails(allTournament[i].name);
        matchesOfTournament.push({tournament: allTournament[i].name, 
          type: allTournament[i].type,
          status: tournamentStatus, 
          startTime: firstMatch[0].matchStartTime, 
          matches: myMatches})
      }
    }
  }
  matchesOfTournament = _.sortBy(matchesOfTournament, 'startTime');
  sendok(matchesOfTournament);
});

async function sendTournamentStatus(tname, started)
{
    tname = tname.toUpperCase();
    var mytournament = await Tournament.findOne({name: tname});
    if (!mytournament) {
        senderr(741, `Invalid tournament name ${tname}`);
        return;
    }
    mytournament.over = started;
    mytournament.save();
    var retsts;
    if (!started)   retsts = `Tournament ${tname} is going on`;
    else            retsts = `Tournament ${tname} has ended`;
    sendok(retsts);
}

async function publishTournament(filter_tournament)
{
  var tlist = await Tournament.find(filter_tournament);
  // tlist = _.map(tlist, o => _.pick(o, ['name', 'desc', 'type', 'over']));
  sendok(tlist);
}


async function publish_teams(filter_teams)
{
  var tlist = await Team.find(filter_teams);
  tlist = _.map(tlist, o => _.pick(o, ['name', 'fullname', 'tournament']));
  sendok(tlist);
}

function sendok(usrmsg) { TournamentRes.send(usrmsg); }
function senderr(errcode, errmsg) { TournamentRes.status(errcode).send(errmsg); }
function setHeader() {
  TournamentRes.header("Access-Control-Allow-Origin", "*");
  TournamentRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}
module.exports = router;