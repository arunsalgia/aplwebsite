import axios from "axios";
import download from 'js-file-download';
import LinearProgressWithLabel from '@material-ui/core/LinearProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgressWithLabel from '@material-ui/core/LinearProgress';

var crypto = require("crypto");

export function cdRefresh() {
  window.location.reload();
}

export function cdCurrent() {
  return String.fromCharCode(169);
}

export function cdDefault() {
  return String.fromCharCode(9745);
}

export function validateSpecialCharacters(sss) {
    var sts = false;
    const TerroristCharacters = [];

    if (!sss.includes("\""))
    if (!sss.includes("\'"))
    if (!sss.includes("\`"))
    if (!sss.includes("\\"))
    if (!sss.includes("/"))
    if (!sss.includes("~"))
    if (!sss.includes("\%"))
    if (!sss.includes("^"))
    if (!sss.includes("\&"))
    if (!sss.includes("\+"))
      sts = true;
    return sts;
}

export function validateMobile(sss) {
  var sts = false;
  const TerroristCharacters = [];

  if (sss.length === 10)
  if (!sss.includes("\."))
  if (!sss.includes("\-"))
  if (!sss.includes("\+"))
  if (!sss.includes("\*"))
  if (!sss.includes("\/"))
  if (!sss.includes("e"))
  if (!sss.includes("E"))
  if (!isNaN(sss))
    sts = true;
  return sts;
}

export function validateEmail(sss) {
    let sts = false;
    if (validateSpecialCharacters(sss)) {
      let xxx = sss.split("@");
      if (xxx.length === 2) {
        if (xxx[1].includes(".")) 
          sts = true;
      }
    }
    return sts;
}


export function hasGroup() {
  //console.log(`current gis is ${localStorage.getItem("gid")}`)
  var sts = false;
    if (localStorage.getItem("gid") !== null) 
    if (localStorage.getItem("gid") !== "") 
    if (localStorage.getItem("gid") !== "0")
      sts = true;
  return sts;
}

export function encrypt(text) {
  let hash="";
  try {
    const cipher = crypto.createCipheriv(process.env.REACT_APP_ALGORITHM, 
      process.env.REACT_APP_AKSHUSECRETKEY, 
      Buffer.from(process.env.REACT_APP_IV, 'hex'));
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    hash = encrypted.toString('hex');
  }
  catch (err) {
    console.log(err);
  } 
  return hash;
};

export function decrypt(hash) {
  const decipher = crypto.createDecipheriv(process.env.REACT_APP_ALGORITHM, 
    process.env.REACT_APP_AKSHUSECRETKEY, 
    Buffer.from(process.env.REACT_APP_IV, 'hex'));
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
  return decrpyted.toString();
};

const AMPM = [
  "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM",
  "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM"
];
  /**
 * @param {Date} d The date
 */
const TZ_IST={hours: 5, minutes: 30};
export function cricDate(d) {
  var xxx = new Date(d.getTime());
  xxx.setHours(xxx.getHours()+TZ_IST.hours);
  xxx.setMinutes(xxx.getMinutes()+TZ_IST.minutes);
  var myHour = xxx.getHours();
  var myampm = AMPM[myHour];
  if (myHour > 12) myHour -= 12;
  var tmp = `${MONTHNAME[xxx.getMonth()]} ${("0" + xxx.getDate()).slice(-2)} ${("0" + myHour).slice(-2)}:${("0" +  xxx.getMinutes()).slice(-2)}${myampm}`
  return tmp;
}

const notToConvert = ['XI', 'ARUN']
/**
 * @param {string} t The date
 */

export function cricTeamName(t) {
  var tmp = t.split(' ');
  for(i=0; i < tmp.length; ++i)  {
    var x = tmp[i].trim().toUpperCase();
    if (notToConvert.includes(x))
      tmp[i] = x;
    else
      tmp[i] = x.substr(0, 1) + x.substr(1, x.length - 1).toLowerCase();
  }
  return tmp.join(' ');
}


export function specialSetPos() {
  //console.log(`in SSP: ${localStorage.getItem("joinGroupCode")}`)
  let retval = parseInt(process.env.REACT_APP_DASHBOARD);  //parseInt(process.env.REACT_APP_GROUP);
  if (localStorage.getItem("joinGroupCode").length > 0)
    retval = parseInt(process.env.REACT_APP_JOINGROUP);
  //console.log(`in SSP: ${retval}`)
  return retval;
}

export function getImageName(teamName) {
  let imageName = `${teamName}.JPG`;
  imageName = imageName.replaceAll(" ", "");
  return imageName;
}

export function currentAPLVersion() {
  return(parseFloat(process.env.REACT_APP_VERSION));
}

export async function latestAPLVersion()  {
  let version = 0.1;
  try {
    let response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/apl/latestversion`);
    // console.log(response);
    // let tmp = response.data;
    version = parseFloat(response.data);
  } catch(err) {
    version = 0.1;
  }
  return version;
}

export async function upGradeRequired() {
  let upGrade = false;
  let upGradeRecord;
  if (process.env.REACT_APP_DEVICE === "MOBILE") {
    let myName = process.env.REACT_APP_NAME;
    let myVersion = process.env.REACT_APP_VERSION;
    let myURL = `${process.env.REACT_APP_APLAXIOS}/apl/confirmlatest/${myName}/APK/${myVersion}`;
    // console.log(myURL);
    let response = await axios.get(myURL);
    // console.log("After axios call", response.data);
    upGrade = (response.data.status) ? false : true;
    upGradeRecord = response.data.latest;
    upGradeRecord.text = internalToText(upGradeRecord.text);
    // console.log(upGradeRecord);
  }
  console.log(`upgrade required: ${upGrade}`);
  return ({status: upGrade, latest: upGradeRecord});
}


export async function org_downloadApk() {
  let myName = process.env.REACT_APP_NAME;
  let myURL = `${process.env.REACT_APP_APLAXIOS}/apl/downloadlatestbinary/${myName}/APK/`;
  try {
    axios({
      method: 'get',
      url: myURL,
      responseType: 'arraybuffer',
      // onDownloadProgress: (progressEvent) => {
      //   // let newPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      //   // console.log("File download in progress ", newPercent);
      // },
      })
      .then( (response) => {
          let myFile = process.env.REACT_APP_NAME + ".APK";
          console.log(myFile);
          download(response.data, myFile);
          console.log("download over");
        }
      )
      .catch(
          (error) => {
            console.log(error);
            console.log("in axios catch");
          }
      ); 
  } catch (e) {
    console.log(e);
    console.log("in try catch");
  } 
  console.log("Debu complete");

}


export async function downloadApk() {
  let myName = process.env.REACT_APP_NAME;
  let myURL = `${process.env.REACT_APP_APLAXIOS}/apl/downloadlatestbinary/${myName}/APK/`;
  try {
    let response = await axios({
      method: 'get',
      url: myURL,
      responseType: 'arraybuffer',
      // onDownloadProgress: (progressEvent) => {
      //   // let newPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      //   // console.log("File download in progress ", newPercent);
      // },
      });
    let myFile = process.env.REACT_APP_NAME + ".APK";
    console.log(myFile);
    download(response.data, myFile);
    console.log("download over");
  } catch (e) {
    console.log(e);
    console.log("in try catch");
  } 
  
  console.log("Debu complete");

}

export function clearBackupData() {
  /* Clear dash board items */
  localStorage.removeItem("saveRank");
  localStorage.removeItem("saveScore");
  localStorage.removeItem("saveMaxRun");
  localStorage.removeItem("saveMaxWicket");
  localStorage.removeItem("statData");
  localStorage.removeItem("saveRankArray");
  /* Clear Stat items */
  localStorage.removeItem("statData");
  /* clear team */
  localStorage.removeItem("team");
  /* clear captain */
  localStorage.removeItem("captain");
  localStorage.removeItem("viceCaptain");
  localStorage.removeItem("captainList");
  /* clear home */
  localStorage.removeItem("home_tournamentList");
  localStorage.removeItem("home_groupList");
}


export function isMobile() {
  return (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Windows Phone/i.test(navigator.userAgent)) ? true : false;
}

export function checkIdle() {

  let x = sessionStorage.getItem("notidle");
  // console.log("Idle storage", x);
  let sts = (x) ? false : true;
  return sts;
}

export function setIdle(idle) {
  if (idle) {
    sessionStorage.removeItem("notidle");
    cdRefresh()
  } else {
    sessionStorage.setItem("notidle", "user is working");
  }
}


const CR = String.fromCharCode(13);
const LF = String.fromCharCode(10);
const SP = String.fromCharCode(32);

const IntCR = String.fromCharCode(128+13);
const IntLF = String.fromCharCode(128+10);
const IntSP = String.fromCharCode(128+32);

export function textToInternal(txt) {
  let txt1 = txt;
  let x = txt1.split(CR);
  txt1 = x.join(IntCR);
  x = txt1.split(LF);
  txt1 = x.join(IntLF);
  x = txt1.split(SP);
  txt1 = x.join(IntSP);
  return txt1;
}

export function internalToText(txt) {
  let txt1 = txt;
  let x = txt1.split(IntCR);
  txt1 = x.join(CR);
  x = txt1.split(IntLF);
  txt1 = x.join(LF);
  x = txt1.split(IntSP);
  txt1 = x.join(SP);
  return txt1;
}