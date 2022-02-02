import { useState } from "react";
import { AppBar, Toolbar, Box, Button, SvgIcon, Link } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import { makeStyles } from "@material-ui/core/styles";
import { ReactComponent as MenuIcon } from "../../assets/icons/hamburger.svg";
import { ReactComponent as StarShipNavLogo } from "../../assets/icons/starship_logo_vector.svg";
import ThemeSwitcher from "./ThemeSwitch";
import { LocaleSwitcher } from "@olympusdao/component-library";
import { locales, selectLocale } from "../../locales";
import "./topbar.scss";
import Wallet from "./Wallet";
import { t } from "@lingui/macro";
import { i18n } from "@lingui/core";

const useStyles = makeStyles(theme => ({
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: "100%",
      padding: "0 1rem",
    },
    justifyContent: "flex-start",
    alignItems: "center",
    background: "#000",
    backdropFilter: "none",
    zIndex: 10,
    flexDirection: "row",
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(981)]: {
      display: "none",
    },
  },
  menuGroup: {
    alignSelf: "center",
    display: "flex",
    justifyContent: "center",
    cursor: "pointer",
    width: "100%",
    alignItems: "center",
    [theme.breakpoints.down(981)]: {
      display: "none",
    },
  },
  menuItem: {
    fontSize: 20,
    color: "white",
    padding: "0 1rem",
    //backgroundColor: "teal",
    minWidth: "6vw",
    //height: "65px",
    // "&:hover": {
    // backgroundColor: "white",
    // },
  },
}));

interface TopBarProps {
  theme: string;
  toggleTheme: (e: KeyboardEvent) => void;
  handleDrawerToggle: () => void;
}

function TopBar({ theme, toggleTheme, handleDrawerToggle }: TopBarProps) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    alert("checked");
  };
  const open = Boolean(anchorEl);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" className={classes.appBar} elevation={1}>
      <Box>
        <img src="starship-guild-logo.svg" alt="Starship Guild Logo" width="330" height="64" className="topbar-logo" />
      </Box>
      <Box className={classes.menuGroup}>
        <Link href={`#/dashboard`} className={classes.menuItem}>
          Dashboard
        </Link>
        <Link href={`#/bonds`} className={classes.menuItem}>
          Mint
        </Link>
        <Link href={`#/stake`} className={classes.menuItem}>
          Stake
        </Link>
        <Link href={`#`} className={classes.menuItem}>
          Buy
        </Link>
      </Box>
      <Toolbar disableGutters className="dapp-topbar">
        <Button
          id="hamburger"
          aria-label="open drawer"
          size="large"
          variant="contained"
          color="secondary"
          onClick={handleDrawerToggle}
          className={classes.menuButton}
        >
          <SvgIcon component={MenuIcon} />
        </Button>
        <Box display="flex">
          <Wallet />
          <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
          <LocaleSwitcher
            initialLocale={i18n.locale}
            locales={locales}
            onLocaleChange={selectLocale}
            label={t`Change locale`}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
