import { useSelector, useDispatch } from "react-redux";
import { getRebaseBlock, secondsUntilBlock, prettifySeconds } from "../../helpers";
import { Box, Typography, Grid } from "@material-ui/core";
import "./rebasetimer.scss";
import { Skeleton } from "@material-ui/lab";
import { useEffect, useMemo, useState } from "react";
import { loadAppDetails } from "../../slices/AppSlice";
import { useWeb3Context } from "../../hooks/web3Context";
import { Trans } from "@lingui/macro";
import { Metric } from "@olympusdao/component-library";

function RebaseTimer() {
  const dispatch = useDispatch();
  const { provider, networkId } = useWeb3Context();

  const SECONDS_TO_REFRESH = 60;
  const [secondsToRebase, setSecondsToRebase] = useState(0);
  const [rebaseString, setRebaseString] = useState("");
  const [secondsToRefresh, setSecondsToRefresh] = useState(SECONDS_TO_REFRESH);

  const currentBlock = useSelector(state => {
    return state.app.currentBlock;
  });
  const secondsToEpoch = useSelector(state => {
    return state.app.secondsToEpoch;
  });

  function initializeTimer() {
    const rebaseBlock = getRebaseBlock(currentBlock);
    const seconds = secondsUntilBlock(currentBlock, rebaseBlock);
    setSecondsToRebase(secondsToEpoch);
    const prettified = prettifySeconds(secondsToEpoch);
    setRebaseString(prettified !== "" ? prettified : <Trans>Less than a minute</Trans>);
  }

  // This initializes secondsToRebase as soon as currentBlock becomes available
  useMemo(() => {
    if (secondsToEpoch) {
      initializeTimer();
    }
  }, [secondsToEpoch]);

  // After every period SECONDS_TO_REFRESH, decrement secondsToRebase by SECONDS_TO_REFRESH,
  // keeping the display up to date without requiring an on chain request to update currentBlock.
  useEffect(() => {
    let interval = null;
    if (secondsToRefresh > 0) {
      interval = setInterval(() => {
        setSecondsToRefresh(secondsToRefresh => secondsToRefresh - 1);
      }, 1000);
    } else {
      // When the countdown goes negative, reload the app details and reinitialize the timer
      if (secondsToRebase < 0) {
        async function reload() {
          await dispatch(loadAppDetails({ networkID: networkId, provider: provider }));
        }
        reload();
        setRebaseString("");
      } else {
        clearInterval(interval);
        setSecondsToRebase(secondsToRebase => secondsToRebase - SECONDS_TO_REFRESH);
        setSecondsToRefresh(SECONDS_TO_REFRESH);
        const prettified = prettifySeconds(secondsToRebase);
        setRebaseString(prettified !== "" ? prettified : <Trans>Less than a minute</Trans>);
      }
    }
    return () => clearInterval(interval);
  }, [secondsToRebase, secondsToRefresh]);

  return (
    // <Box className="rebase-timer">
    //   <Typography variant="body2">
    //     {currentBlock ? (
    //       secondsToRebase > 0 ? (
    //         <>
    //           <strong>{rebaseString}&nbsp;</strong>
    //         </>
    //       ) : (
    //         <strong>rebasing</strong>
    //       )
    //     ) : (
    //       <Skeleton width="155px" />
    //     )}
    //   </Typography>
    // </Box>
    <div className="grid-container">
      <Box className="metric-container">
        <Typography
          variant="h5"
          color="textSecondary"
          className="card-title-text"
          style={{ fontWeight: 400, overflow: "hidden" }}
        >
          Next STAR Price
        </Typography>
        <Typography variant="h4">
          {currentBlock ? (
            secondsToRebase > 0 ? (
              <>
                <strong>{rebaseString}&nbsp;</strong>
              </>
            ) : (
              <strong>rebasing</strong>
            )
          ) : (
            <Skeleton width="155px" />
          )}{" "}
        </Typography>
      </Box>
    </div>
  );
}

export default RebaseTimer;
