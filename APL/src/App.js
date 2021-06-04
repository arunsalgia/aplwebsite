import React, { useState, useMemo } from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { UserContext } from "./UserContext";
//import Admin from "layouts/Admin.js";
import AplMain from "views/AplMain"
import "assets/css/material-dashboard-react.css?v=1.9.0";
// import { DesktopWindows } from "@material-ui/icons";
import IdleTimer from 'react-idle-timer'
import { setIdle }from "views/functions.js"
import { PinDropSharp } from "@material-ui/icons";


const hist = createBrowserHistory();


function AppRouter() {

  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user, setUser]);
  var idleTimer = null;
  
  // console.log(`000. User is ${localStorage.getItem("uid")}`)
  
  

/**
  function DispayTabs() {
    let isLogged = isUserLogged();
    // console.log("Login status", isLogged)
    if (isLogged) {
      // get time out value in milliseconds
      // console.log("User is logged");
      let timeoutvalue = parseInt(process.env.REACT_APP_IDLETIMEOUT) * 1000;
      return (
        <div>
          <CricDreamTabs/>
          <IdleTimer
            ref={ref => { idleTimer = ref }}
            timeout={timeoutvalue}
            // onAction={handleOnAction}
            // onActive={handleOnActive}
            onIdle={handleOnIdle}
            debounce={250}
          />
        </div>
      )  
    } else {
      console.log("New login requested");
      if (localStorage.getItem("currentLogin") === "SIGNUP")
        return (<SignUp/>)
      else if (localStorage.getItem("currentLogin") === "RESET")
        return (<ForgotPassword/>)
      else
        return (<SignIn/>)
    }
  }

 ***/
 


  return (
    <Router history={hist}> 
    <UserContext.Provider value={value}>
    </UserContext.Provider>
    {/* <DispayTabs /> */}
    <AplMain />
    </Router>
  );

}

export default AppRouter;
