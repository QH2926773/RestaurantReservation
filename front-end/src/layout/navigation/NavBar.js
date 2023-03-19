import MobileNavigation from "./MobileNavigation";
import Navigation from "./Navigation";
import classes from "./NavBar.module.css";

function NavBar() {
  return (
    <div className={classes.NavBar}>
      <Navigation />
      <MobileNavigation />
    </div>
  );
}

export default NavBar;
