import { Button, Typography, Grid, Paper, Tooltip } from "@material-ui/core";
import Countdown from "react-countdown";
import SvgIcon from "@material-ui/core/SvgIcon";
import { ReactComponent as ClockIcon } from "../../assets/icons/clock.svg";
import { ReactComponent as CheckIcon } from "../../assets/icons/check-circle.svg";
import { useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import { useAppDispatch } from "src/hooks";
import { getRedemptionBalances } from "src/slices/AccountSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { useWeb3Context } from "src/hooks/web3Context";
import { Skeleton } from "@material-ui/lab";
import { BigNumber } from "bignumber.js";
import { RecipientModal, SubmitCallback, CancelCallback } from "src/views/Give/RecipientModal";
import { changeGive } from "src/slices/GiveThunk";
import { error } from "../../slices/MessagesSlice";
import { Project } from "./project.type";
import { countDecimals, roundToDecimal, toInteger } from "./utils";

type CountdownProps = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  completed: boolean;
};

type ProjectDetailsProps = {
  project: Project;
};

export default function ProjectDetails({ project }: ProjectDetailsProps) {
  const { provider, address, connected, connect, chainID } = useWeb3Context();
  const { title, owner, details, finishDate, photos, category, wallet, depositGoal } = project;
  const [recipientInfoIsLoading, setRecipientInfoIsLoading] = useState(true);
  const [totalDebt, setTotalDebt] = useState("");

  const [isGiveModalOpen, setIsGiveModalOpen] = useState(false);

  const theme = useTheme();
  // We use useAppDispatch here so the result of the AsyncThunkAction is typed correctly
  // See: https://stackoverflow.com/a/66753532
  const dispatch = useAppDispatch();

  // We use dispatch to asynchronously fetch the results, and then update state variables so that the component refreshes
  dispatch(
    getRedemptionBalances({
      networkID: chainID,
      provider: provider,
      address: wallet,
    }),
  )
    .then(unwrapResult)
    .then(resultAction => {
      setTotalDebt(resultAction.redeeming.recipientInfo.totalDebt);
      setRecipientInfoIsLoading(false);
    });

  // The JSON file returns a string, so we convert it
  const finishDateObject = finishDate ? new Date(finishDate) : null;
  const countdownRenderer = ({ days, hours, completed }: CountdownProps) => {
    if (completed)
      return (
        <>
          <div className="cause-info-icon">
            <SvgIcon component={ClockIcon} color="primary" />
          </div>
          <div>
            <strong>Fundraise Complete!</strong>
          </div>
        </>
      );

    return (
      <>
        <div className="cause-info-icon">
          <SvgIcon component={ClockIcon} color="primary" />
        </div>
        <div>
          <Tooltip
            title={!finishDateObject ? "" : "Finishes at " + finishDateObject.toLocaleString() + " in your timezone"}
            arrow
          >
            <div>
              <strong>
                {days} days, {hours} hours
              </strong>{" "}
              remaining
            </div>
          </Tooltip>
        </div>
      </>
    );
  };

  const getGoalCompletion = (): string => {
    if (!depositGoal) return "NaN";
    if (recipientInfoIsLoading) return ""; // This shouldn't be needed, but just to be sure...
    if (!totalDebt) return "0";

    const totalDebtNumber = new BigNumber(totalDebt);

    return totalDebtNumber.div(depositGoal).multipliedBy(100).toFixed();
  };

  const renderGoalCompletion = (): JSX.Element => {
    const goalCompletion = getGoalCompletion();
    const formattedGoalCompletion =
      countDecimals(goalCompletion) === 0 ? toInteger(goalCompletion) : roundToDecimal(goalCompletion);

    return (
      <>
        <div className="cause-info-icon">
          <SvgIcon component={CheckIcon} color="primary" />
        </div>
        <div>
          <Tooltip title={totalDebt + " of " + depositGoal + " sOHM raised"} arrow>
            <div>
              <strong>{recipientInfoIsLoading ? <Skeleton /> : formattedGoalCompletion}%</strong> <span>of goal</span>
            </div>
          </Tooltip>
        </div>
      </>
    );
  };

  const getProjectImage = (): JSX.Element => {
    // We return an empty image with a set width, so that the spacing remains the same.
    if (!photos || photos.length < 1)
      return (
        <div className="cause-image">
          <img width="100%" src="" />
        </div>
      );

    return (
      <div className="cause-image">
        <img width="100%" src={`${process.env.PUBLIC_URL}${photos[0]}`} />
      </div>
    );
  };

  const handleGiveButtonClick = () => {
    setIsGiveModalOpen(true);
  };

  const handleGiveModalSubmit: SubmitCallback = async (
    walletAddress: string,
    depositAmount: BigNumber,
    depositAmountDiff?: BigNumber,
  ) => {
    if (depositAmount.isEqualTo(new BigNumber(0))) {
      return dispatch(error("Please enter a value!"));
    }

    // Record segment user event

    // If reducing the amount of deposit, withdraw
    await dispatch(
      changeGive({
        action: "editGive",
        value: depositAmount.toFixed(),
        recipient: walletAddress,
        provider,
        address,
        networkID: chainID,
      }),
    );

    setIsGiveModalOpen(false);
  };

  const handleGiveModalCancel: CancelCallback = () => {
    setIsGiveModalOpen(false);
  };

  return (
    <>
      <Paper>
        <Grid item className="cause-card" key={title}>
          {getProjectImage()}
          <div className="cause-content">
            <Grid container justifyContent="space-between">
              <Grid item className="cause-title">
                <Typography variant="h6">{title}</Typography>
              </Grid>
              <Grid item className="cause-category" style={{ backgroundColor: theme.palette.background.default }}>
                {category}
              </Grid>
            </Grid>
            <Typography variant="body1" style={{ fontSize: 12 }}>
              {owner}
            </Typography>
            <div className="cause-body">
              <Typography variant="body2">{details}</Typography>
            </div>
            <Grid container direction="column" className="cause-misc-info">
              <Grid item xs={3}>
                {finishDateObject ? <Countdown date={finishDateObject} renderer={countdownRenderer} /> : <></>}
              </Grid>
              <Grid item xs={3}>
                {renderGoalCompletion()}
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  className="cause-give-button"
                  onClick={() => handleGiveButtonClick()}
                  disabled={!address}
                >
                  Give Yield
                </Button>
              </Grid>
            </Grid>
          </div>
          <RecipientModal
            isModalOpen={isGiveModalOpen}
            callbackFunc={handleGiveModalSubmit}
            cancelFunc={handleGiveModalCancel}
            project={project}
            key={title}
          />
        </Grid>
      </Paper>
    </>
  );
}