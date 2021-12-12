import { Paper, Box, Button, Typography, SvgIcon } from "@material-ui/core";
import { DepositSohm, LockInVault, ReceivesYield, ArrowGraphic } from "../../components/EducationCard";
import { ReactComponent as ArrowUp } from "../../assets/icons/arrow-up.svg";

export function GiveInfo() {
  return (
    <>
      <Paper className={"ohm-card secondary"}>
        <div className="give-info">
          <Box className="give-info-deposit-box">
            <DepositSohm message="Deposit sOHM from wallet" />
          </Box>
          <Box className="give-info-vault-box">
            <LockInVault message="Lock sOHM in vault" />
          </Box>
          <Box className="give-info-yield-box">
            <ReceivesYield message="Recipient earns sOHM rebases" />
          </Box>
        </div>
        <Box className="button-box">
          <Button
            variant="outlined"
            color="secondary"
            href="https://docs.olympusdao.finance/main/"
            target="_blank"
            className="learn-more-button"
          >
            <Typography variant="body1">Learn More</Typography>
            <SvgIcon component={ArrowUp} color="primary" />
          </Button>
        </Box>
      </Paper>
    </>
  );
}