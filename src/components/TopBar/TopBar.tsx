import { AppBar, Toolbar, Box, Button, SvgIcon, Typography } from "@material-ui/core";
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
    justifyContent: "center",
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
}));

interface TopBarProps {
  theme: string;
  toggleTheme: (e: KeyboardEvent) => void;
  handleDrawerToggle: () => void;
}

function TopBar({ theme, toggleTheme, handleDrawerToggle }: TopBarProps) {
  const classes = useStyles();

  return (
    <AppBar position="fixed" className={classes.appBar} elevation={1}>
      <Box>
        <img src="starship-guild-logo.svg" alt="Starship Guild Logo" width="330" height="64" className="topbar-logo" />
      </Box>
      <Toolbar disableGutters className="dapp-topbar">
        <Typography>Logo</Typography>
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
