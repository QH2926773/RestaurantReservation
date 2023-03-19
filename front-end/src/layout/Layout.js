import React from "react";
import NavBar from "./navigation/NavBar";
import Routes from "./Routes";

import "./Layout.css";

/**
 * Defines the main layout of the application.
 *
 * You will not need to make changes to this file.
 *
 * @returns {JSX.Element}
 */

function Layout() {
  return (
    <div className="container-fluid background">
      <title>
        <h1>periodic tables</h1>
      </title>
      <div className="row h-100">
        <div className="bar">
          <NavBar />
        </div>
        <div className="routes">
          <Routes />
        </div>
      </div>
    </div>
  );
}

export default Layout;