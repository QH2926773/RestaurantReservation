import classes from "./NavBar.module.css";
import NavLinks from "./NavLinks";

const MobileNavigation = () => {
  return (
    <nav className={classes.MobileNavigation}>
      <NavLinks />
    </nav>
  );
};

export default MobileNavigation;
