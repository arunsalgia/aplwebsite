import React, { useState, useEffect } from 'react';
import './App.css';
import axios from "axios";
import Grid from '@material-ui/core/Grid';
import download from 'js-file-download';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
// import { makeStyles } from '@material-ui/core/styles';
import globalStyles from "assets/globalStyles";
import { template } from 'lodash';
import { downloadApk } from "views/functions";
import { BlankArea } from "customComponents/CustomComponents";

// import desktopImage from './DESKTOP.JPG';
// import mobileImage from './MOBILE.JPG';
// import Mojo1 from './Mojo1';
// import Image from './Image';


const APPNAME  = process.env.REACT_APP_NAME;
const APLAXIOS = process.env.REACT_APP_APLAXIOS;
const BRHEIGHT = 8;

const APLMain = () => {
    let gClasses = globalStyles();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [bgImage, setBgImage] = useState("DESKTOP")

    // const imageUrl =  ? desktopImage : mobileImage;
    
    const [breakCount, setBreakCount] = useState(0);
    const [dummyArray, setDummyArray] = useState([]);
    const [ downloadMessage, setDownloadMessage ] = useState("");

    function calculateBR() {
        console.log(window.innerHeight, BRHEIGHT);
        let myCount = Math.floor(window.innerHeight / BRHEIGHT) - 10;
        if (myCount < 1) myCount = 1;
        if (myCount > (200-1)) myCount = (200-1);
        setBreakCount(myCount);
        console.log(breakCount);
        let tmp = (window.innerWidth >= 650) ? "DESKTOP" : "MOBILE";
        console.log("Imgae is", tmp);
        setBgImage(tmp);
    }
    useEffect(() => {
        let tmp=[];
        for(let i=0; i<200; ++i) {
            tmp.push(i);
        }
        setDummyArray(tmp);
        calculateBR();

        const handleWindowResize = () => {
            console.log(window.innerHeight, window.innerWidth);
            calculateBR();
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        };
        
        window.addEventListener('resize', handleWindowResize);

        return () => {
           window.removeEventListener('resize', handleWindowResize);
        }
    }, []);
    
    function junkBlankArea() { return <h3></h3> }

    async function junkdownloadApk() {
        let myURL = `${APLAXIOS}/apl/downloadlatestbinary/${APPNAME}/APK/`;
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
          let myFile = APPNAME + ".APK";
          console.log(myFile);
          download(response.data, myFile);
          console.log("download over");
        } catch (e) {
          console.log(e);
          console.log("in try catch");
        } 
        
        console.log("Debu complete");
      
      }
      
      
    async function handleDownload() {
        try {
            setDownloadMessage("APL Android app download started. Please wait...")
            // console.log("Download Android app");
            await downloadApk();
            setDownloadMessage("APL Android app download complete.")
            // console.log("APK has to be downloaded");
          } catch (e) {
            setDownloadMessage("Error encountred while downloading APL Android app", true)
          }
    }

    function handleBrowser() {
        window.open("https://happy-home-ipl-2020.herokuapp.com/");
    }

    function DisplayEasy() {
    return(
        <p>
            <span className={gClasses.left}>Auction Premier League</span>
            <span className={gClasses.right}> is easy to play with.</span>
        </p>
    )}

    let myIMage= `${process.env.PUBLIC_URL}/image/${bgImage}.JPG`;
    console.log(myIMage);
    console.log(breakCount);
    console.log(dummyArray.length);
    return (
        // <div className="App" style={{backgroundImage: `url(${imageUrl})` }}>
        <div className="App">
            <div className="App-content">
                <img src={myIMage} alt="ARUN" height={setWindowHeight} width={windowWidth}/>
                {/* {dummyArray.slice(0, breakCount).map( (x) => {
                    return <br/>
                })} */}
                <Button className={gClasses.button} type="submit" variant="contained" color="primary" 
                    onClick={handleDownload}
		            //className={gClasses.button}
		        >
                Download
                </Button>
                <Button className={gClasses.button} type="submit" variant="contained" color="primary" 
                    onClick={handleBrowser}
		            //className={gClasses.button}
		        >
                Open in Browser
                </Button>
                <Typography className={gClasses.nonerror} align="center">{downloadMessage}</Typography>
                <BlankArea/>
                <DisplayEasy />
                <BlankArea/>
                {/* <h1>Pineapples</h1> */}
                {/* <p>They are good</p> */}
            </div>
        </div>
    );
};

export default APLMain;
