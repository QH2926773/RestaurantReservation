import classes from "./NavBar.module.css";
import NavLinks from "./NavLinks";

const Navigation = () => {
  return (
    <div>
      <nav className={classes.Navigation}>
        <NavLinks />
      </nav>
    </div>
  );
};
export default Navigation;