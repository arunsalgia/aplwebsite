var router = express.Router();
var MatchRes;
// var _group;
// var _tournament;

// /**
//  * @param {Date} d The date
//  */
// function cricDate(d)  {
//   var myHour = d.getHours();
//   var myampm = AMPM[myHour];
//   if (myHour > 12) myHour -= 12;
//   var tmp = MONTHNAME[d.getMonth()] + ' '  + ("0" + d.getDate()).slice(-2) + ' . ' + 
//       ("0" + myHour).slice(-2) + ':' + ("0" +  d.getMinutes()).slice(-2) + ' ' + myampm;
//   return tmp;
// }

// const notToConvert = ['XI', 'ARUN']
// /**
//  * @param {string} t The date
//  */
// function cricTeamName(t)  {
//   var tmp = t.split(' ');
//   for(i=0; i < tmp.length; ++i)  {
//     var x = tmp[i].trim().toUpperCase();
//     if (notToConvert.includes(x))
//       tmp[i] = x;
//     else
//       tmp[i] = x.substr(0, 1) + x.substr(1, x.length - 1).toLowerCase();
//   }
//   return tmp.join(' ');
// }

/* GET all users listing. */
router.use('/', function(req, res, next) {
  MatchRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR,  ERR_NODB); return; }
  
  var tmp = req.url.split('/');
  if (!["DATE"].includes(tmp[1].toUpperCase()))
  if (!["MATCHINFO"].includes(tmp[1].toUpperCase()))
  {
    // console.log("Hello")
    // take care of /list/csk  ,   /list/csk/rr,  /list
    switch (tmp.length)
    {
      case 2:  
        if (tmp[1].length == 0) tmp[1] = "all";
        req.url = "/list/" + tmp[1] + "/none";
        break;
      case 3:
        if (tmp[2].length == 0) 
          tmp[2] = "none";
        req.url = "/list/" + tmp[1] + "/" + tmp[2];
        break;  
      case 4: 
        if (tmp[3].length == 0) 
          req.url = "/list/" + tmp[1] + "/" + tmp[2];
        break;
    }
  }
  //console.log("Modified: " + req.url);
  next('route');
});




router.get('/matchinfo/:myGroup', async function(req, res, next) {
  MatchRes = res;  
  setHeader();
  
  var {myGroup} = req.params;
  var groupRec = await IPLGroup.findOne({gid: myGroup});
  if (groupRec)
    sendMatchInfoToClient(groupRec.gid, SENDRES);
  else
    senderr(662, `Invalid group ${myGroup}`);
});

// GET all matches to be held on give date 
// router.get('/date/:mydate', function(req, res, next) {
//   MatchRes = res;
//   setHeader();
//   var {mydate} = req.params;
//   var todayDate = new Date();

//   var maxDayRange = 1;
//   switch (mydate.toUpperCase())
//   {
//     case "UPCOMING":
//       //todayDate.setDate(todayDate.getDate()-10);
//       mydate = todayDate.getFullYear().toString() + "-" +
//               (todayDate.getMonth()+1).toString() + "-" +
//               todayDate.getDate().toString() + " " +
//               todayDate.getHours().toString() + ":" +
//               todayDate.getMinutes().toString();
//       maxDayRange = 200;
//       break;
//     case "TODAY":
//       mydate = todayDate.getFullYear().toString() + "-" +
//               (todayDate.getMonth()+1).toString() + "-" +
//               todayDate.getDate().toString();
//       break;
//     case "YESTERDAY":
//       todayDate.setDate(todayDate.getDate()-1);
//       mydate = todayDate.getFullYear().toString() + "-" +
//               (todayDate.getMonth()+1).toString() + "-" +
//               todayDate.getDate().toString();
//       break;
//     case "TOMORROW":
//       todayDate.setDate(todayDate.getDate()+1);
//       mydate = todayDate.getFullYear().toString() + "-" +
//               (todayDate.getMonth()+1).toString() + "-" +
//               todayDate.getDate().toString();
//       break;
//   }
//   console.log(`Date: ${mydate} and Range ${maxDayRange}`)
//   var startDate, endDate;
//   startDate =   new Date(mydate);
//   if (isNaN(startDate)) { senderr(661, `Invalid date ${mydate}`); return; }
//   endDate = new Date(startDate.getTime());        // clone start date
//   endDate.setDate(startDate.getDate()+maxDayRange);
//   endDate.setHours(0);
//   endDate.setMinutes(0);
//   endDate.setSeconds(0);
  
//   //var currdate = new Date();
//   //console.log(`Curr Date: ${currdate} Start Date: ${startDate}   End Date: ${endDate}`);
//   let myfilter = { tournament: _tournament, matchStartTime: { $gte: startDate, $lt: endDate } };
//   publish_matches(myfilter);
// });

async function sendMatchInfoToClient(igroup, doSendWhat) {
  // var igroup = _group;
  var currTime = new Date();
  currTime.setDate(currTime.getDate())
  var myGroup = await IPLGroup.find({"gid": igroup})
  var myMatches = await CricapiMatch.find({tournament: myGroup[0].tournament});

  // get current match list (may be 2 matches are running). So send it in array list
  // var tmp = _.filter(myMatches, x => (x.matchStarted || _.gte (currTime, x.matchStartTime)) && (x.matchEnded || _.lte(currTime,x.matchEndTime)));
  var tmp = _.filter(myMatches, x => _.gte (currTime, x.matchStartTime) && x.matchEnded === false);
  var currMatches = [];
  tmp.forEach(m => {
    // console.log(m.matchStartTime);
    currMatches.push({team1: cricTeamName(m.team1), team2: cricTeamName(m.team2), matchTime: cricDate(m.matchStartTime)});
  })
  // console.log(currMatches);
  // now get upcoming match. Limit it to 5
  const upcominCount = 5;
  tmp = _.filter(myMatches, x => _.gte(x.matchStartTime, currTime));
  tmp = _.sortBy(tmp, 'matchStartTime');
  tmp = _.slice(tmp, 0, upcominCount);
  var upcomingMatches = [];
  tmp.forEach(m => {
    // console.log(m.matchStartTime);
    upcomingMatches.push({team1: cricTeamName(m.team1), team2: cricTeamName(m.team2), matchTime: cricDate(m.matchStartTime)});
  })
  // console.log(upcomingMatches);

  if (doSendWhat === SENDRES) {
    sendok({current: currMatches, upcoming: upcomingMatches});
  } else {
    const socket = app.get("socket");
    socket.emit("currentMatch", currMatches)
    socket.broadcast.emit('curentMatch', currMatches);
    socket.emit("upcomingMatch", upcomingMatches)
    socket.broadcast.emit('upcomingMatch', upcomingMatches);
  }
}

async function publish_matches(myfilter)
{
  // console.log(myfilter);
  var matchlist = await CricapiMatch.find(myfilter);  
  sendok(matchlist);
}
async function publish_matches_r0(myfilter)
{
  //console.log(myfilter);
    var matchlist = await Match.find(myfilter);
    
    sendok(matchlist);
}

function sendok(usrmsg) { MatchRes.send(usrmsg); }
function senderr(errcode, errmsg) { MatchRes.status(errcode).send(errmsg); }
function setHeader() {
  MatchRes.header("Access-Control-Allow-Origin", "*");
  MatchRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  _group = defaultGroup;
  // _tournament = defaultTournament;
}

module.exports = router;