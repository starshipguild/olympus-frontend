import { useCallback, useState, useEffect, ChangeEvent, ChangeEventHandler } from "react";
import { useDispatch } from "react-redux";
import { usePathForNetwork } from "src/hooks/usePathForNetwork";
import { useHistory } from "react-router";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Paper,
  Tab,
  Tabs,
  Typography,
  Zoom,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import { t, Trans } from "@lingui/macro";
import { GiHamburgerMenu } from "react-icons/gi";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import RebaseTimer from "../../components/RebaseTimer/RebaseTimer";
import TabPanel from "../../components/TabPanel";
import { getGohmBalFromSohm, trim } from "../../helpers";
import { changeApproval, changeStake } from "../../slices/StakeThunk";
import { changeApproval as changeGohmApproval } from "../../slices/WrapThunk";
import "./stake.scss";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
import ExternalStakePool from "./ExternalStakePool";
import { error } from "../../slices/MessagesSlice";
import { ethers } from "ethers";
import ZapCta from "../Zap/ZapCta";
import { useAppSelector } from "src/hooks";
import { ExpandMore } from "@material-ui/icons";
import { Metric, MetricCollection, DataRow } from "@olympusdao/component-library";
import { ConfirmDialog } from "./ConfirmDialog";

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function Stake() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { provider, address, connect, networkId } = useWeb3Context();
  usePathForNetwork({ pathName: "stake", networkID: networkId, history });

  const [zoomed, setZoomed] = useState(false);
  const [view, setView] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [confirmation, setConfirmation] = useState(false);

  const isAppLoading = useAppSelector(state => state.app.loading);
  const currentIndex = useAppSelector(state => {
    return state.app.currentIndex ?? "1";
  });
  const fiveDayRate = useAppSelector(state => {
    return state.app.fiveDayRate;
  });
  const ohmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.ohm;
  });
  const sohmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.sohm;
  });
  const sohmV1Balance = useAppSelector(state => {
    return state.account.balances && state.account.balances.sohmV1;
  });
  const fsohmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.fsohm;
  });
  const fgohmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.fgohm;
  });
  const fgOHMAsfsOHMBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.fgOHMAsfsOHM;
  });
  const wsohmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.wsohm;
  });
  const fiatDaowsohmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.fiatDaowsohm;
  });
  const calculateWrappedAsSohm = (balance: string) => {
    return Number(balance) * Number(currentIndex);
  };
  const fiatDaoAsSohm = calculateWrappedAsSohm(fiatDaowsohmBalance);
  const gOhmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.gohm;
  });
  const gOhmAsSohm = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmAsSohmBal;
  });

  const gOhmOnArbitrum = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnArbitrum;
  });
  const gOhmOnArbAsSohm = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnArbAsSohm;
  });

  const gOhmOnAvax = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnAvax;
  });
  const gOhmOnAvaxAsSohm = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnAvaxAsSohm;
  });

  const gOhmOnPolygon = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnPolygon;
  });
  const gOhmOnPolygonAsSohm = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnPolygonAsSohm;
  });

  const gOhmOnFantom = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnFantom;
  });
  const gOhmOnFantomAsSohm = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnFantomAsSohm;
  });

  const wsohmAsSohm = calculateWrappedAsSohm(wsohmBalance);

  const stakeAllowance = useAppSelector(state => {
    return (state.account.staking && state.account.staking.ohmStake) || 0;
  });
  const unstakeAllowance = useAppSelector(state => {
    return (state.account.staking && state.account.staking.ohmUnstake) || 0;
  });

  const directUnstakeAllowance = useAppSelector(state => {
    return (state.account.wrapping && state.account.wrapping.gOhmUnwrap) || 0;
  });

  const stakingRebase = useAppSelector(state => {
    return state.app.stakingRebase || 0;
  });
  const stakingAPY = useAppSelector(state => {
    return state.app.stakingAPY || 0;
  });
  const stakingTVL = useAppSelector(state => {
    return state.app.stakingTVL || 0;
  });

  const pendingTransactions = useAppSelector(state => {
    return state.pendingTransactions;
  });

  const setMax = () => {
    if (view === 0) {
      setQuantity(ohmBalance);
    } else {
      setQuantity(sohmBalance);
    }
  };

  const onSeekApproval = async (token: string) => {
    if (token === "gohm") {
      await dispatch(changeGohmApproval({ address, token: token.toLowerCase(), provider, networkID: networkId }));
    } else {
      await dispatch(changeApproval({ address, token, provider, networkID: networkId, version2: true }));
    }
  };

  const onChangeStake = async (action: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(Number(quantity)) || Number(quantity) === 0 || Number(quantity) < 0) {
      // eslint-disable-next-line no-alert
      return dispatch(error(t`Please enter a value!`));
    }

    // 1st catch if quantity > balance
    let gweiValue = ethers.utils.parseUnits(quantity.toString(), "gwei");
    if (action === "stake" && gweiValue.gt(ethers.utils.parseUnits(ohmBalance, "gwei"))) {
      return dispatch(error(t`You cannot stake more than your OHM balance.`));
    }

    if (confirmation === false && action === "unstake" && gweiValue.gt(ethers.utils.parseUnits(sohmBalance, "gwei"))) {
      return dispatch(
        error(
          t`You do not have enough sOHM to complete this transaction.  To unstake from gOHM, please toggle the sohm-gohm switch.`,
        ),
      );
    }

    /**
     * converts sOHM quantity to gOHM quantity when box is checked for gOHM staking
     * @returns sOHM as gOHM quantity
     */
    // const formQuant = checked && currentIndex && view === 1 ? quantity / Number(currentIndex) : quantity;
    const formQuant = async () => {
      if (confirmation && currentIndex && view === 1) {
        return await getGohmBalFromSohm({ provider, networkID: networkId, sOHMbalance: quantity });
      } else {
        return quantity;
      }
    };

    await dispatch(
      changeStake({
        address,
        action,
        value: await formQuant(),
        provider,
        networkID: networkId,
        version2: true,
        rebase: !confirmation,
      }),
    );
  };

  const hasAllowance = useCallback(
    token => {
      if (token === "ohm") return stakeAllowance > 0;
      if (token === "sohm") return unstakeAllowance > 0;
      if (token === "gohm") return directUnstakeAllowance > 0;
      return 0;
    },
    [stakeAllowance, unstakeAllowance, directUnstakeAllowance],
  );

  const isAllowanceDataLoading = (stakeAllowance == null && view === 0) || (unstakeAllowance == null && view === 1);

  let modalButton = [];

  modalButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      <Trans>Connect Wallet</Trans>
    </Button>,
  );

  const changeView = (_event: React.ChangeEvent<{}>, newView: number) => {
    setView(newView);
  };

  const handleChangeQuantity = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
    if (Number(e.target.value) >= 0) setQuantity(e.target.value);
  }, []);

  const trimmedBalance = Number(
    [
      sohmBalance,
      gOhmAsSohm,
      gOhmOnArbAsSohm,
      gOhmOnAvaxAsSohm,
      gOhmOnPolygonAsSohm,
      gOhmOnFantomAsSohm,
      sohmV1Balance,
      wsohmAsSohm,
      fiatDaoAsSohm,
      fsohmBalance,
      fgOHMAsfsOHMBalance,
    ]
      .filter(Boolean)
      .map(balance => Number(balance))
      .reduce((a, b) => a + b, 0)
      .toFixed(4),
  );
  const trimmedStakingAPY = trim(stakingAPY * 100, 1);

  const stakingRebasePercentage = trim(stakingRebase * 100, 4);
  const nextRewardValue = trim((Number(stakingRebasePercentage) / 100) * trimmedBalance, 4);

  const formattedTrimmedStakingAPY = new Intl.NumberFormat("en-US").format(Number(trimmedStakingAPY));
  const formattedStakingTVL = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(stakingTVL);
  const formattedCurrentIndex = trim(Number(currentIndex), 1);

  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div id="stake-view">
      <Zoom in={true} onEntered={() => setZoomed(true)}>
        <Paper className={`ohm-card`}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Box className="card-header">
                <span className="section-icon">
                  <GiHamburgerMenu />
                </span>{" "}
                <span className="section-title">{t`Stake`}</span>
              </Box>
            </Grid>

            <Grid item>
              <MetricCollection>
                <RebaseTimer />
                <div className="divider-container">
                  <div className="vertical-divider"></div>
                </div>
                <Metric
                  className="stake-apy"
                  label={t`Staking APY`}
                  metric={`${formattedTrimmedStakingAPY}%`}
                  isLoading={stakingAPY ? false : true}
                />
              </MetricCollection>
            </Grid>
            <div className="staking-area">
              {!address ? (
                <div className="stake-wallet-notification">
                  <div className="wallet-menu" id="wallet-menu">
                    {modalButton}
                  </div>
                  <Typography variant="h6">
                    <Trans>Connect your wallet to stake STAR</Trans>
                  </Typography>
                </div>
              ) : (
                <>
                  <Box className="stake-action-area">
                    <Tabs
                      key={String(zoomed)}
                      centered
                      value={view}
                      textColor="primary"
                      indicatorColor="primary"
                      className="stake-tab-buttons"
                      onChange={changeView}
                      aria-label="stake tabs"
                      //hides the tab underline sliding animation in while <Zoom> is loading
                      TabIndicatorProps={!zoomed ? { style: { display: "none" } } : undefined}
                    >
                      <Tab
                        label={t({
                          id: "do_stake",
                          comment: "The action of staking (verb)",
                        })}
                        {...a11yProps(0)}
                      />
                      <Tab label={t`Unstake`} {...a11yProps(1)} />
                    </Tabs>
                    <Grid container className="stake-action-row">
                      {/*** Please leave this info section for now. Might be useful for UX at a later date. */}
                      {/* 
                      <Grid item xs={12} sm={8} className="stake-grid-item">
                        {address && !isAllowanceDataLoading ? (
                          (!hasAllowance("ohm") && view === 0) ||
                          (!hasAllowance("sohm") && view === 1 && !confirmation) ||
                          (!hasAllowance("gohm") && view === 1 && confirmation) ? (
                            <Box className="help-text">
                              <Typography variant="body1" className="stake-note" color="textSecondary">
                                {view === 0 ? (
                                  <>
                                    <Trans>First time staking</Trans> <b>OHM</b>?
                                    <br />
                                    <Trans>Please approve Olympus Dao to use your</Trans> <b>OHM</b>{" "}
                                    <Trans>for staking</Trans>.
                                  </>
                                ) : (
                                  <>
                                    <Trans>First time unstaking</Trans> <b>{confirmation ? "gOHM" : "sOHM"}</b>?
                                    <br />
                                    <Trans>Please approve Olympus Dao to use your</Trans>{" "}
                                    <b>{confirmation ? "gOHM" : "sOHM"}</b> <Trans>for unstaking</Trans>.
                                  </>
                                )}
                              </Typography>
                            </Box>
                          ) : (
                            <FormControl className="ohm-input" variant="outlined" color="primary">
                              <InputLabel htmlFor="amount-input"></InputLabel>
                              <OutlinedInput
                                id="amount-input"
                                type="number"
                                placeholder="Enter an amount"
                                className="stake-input"
                                value={quantity}
                                onChange={handleChangeQuantity}
                                labelWidth={0}
                                endAdornment={
                                  <InputAdornment position="end">
                                    <Button variant="text" onClick={setMax} color="inherit">
                                      Max
                                    </Button>
                                  </InputAdornment>
                                }
                              />
                            </FormControl>
                          )
                        ) : (
                          <Skeleton width="150px" />
                        )}
                      </Grid> */}
                      <Grid item xs={12} sm={4} className="stake-grid-item">
                        <TabPanel value={view} index={0} className="stake-tab-panel">
                          <Box m={-2}>
                            {isAllowanceDataLoading ? (
                              <Skeleton />
                            ) : address && hasAllowance("ohm") ? (
                              <Button
                                className="stake-button"
                                variant="contained"
                                color="primary"
                                disabled={isPendingTxn(pendingTransactions, "staking")}
                                onClick={() => {
                                  onChangeStake("stake");
                                }}
                              >
                                {txnButtonText(pendingTransactions, "staking", `${t`Stake to`} sSTAR`)}
                              </Button>
                            ) : (
                              <Button
                                className="stake-button"
                                variant="contained"
                                color="primary"
                                disabled={isPendingTxn(pendingTransactions, "approve_staking")}
                                onClick={() => {
                                  onSeekApproval("ohm");
                                }}
                              >
                                {txnButtonText(pendingTransactions, "approve_staking", t`Approve Staking`)}
                              </Button>
                            )}
                          </Box>
                        </TabPanel>

                        <TabPanel value={view} index={1} className="stake-tab-panel">
                          <Box m={-2}>
                            {isAllowanceDataLoading ? (
                              <Skeleton />
                            ) : address && hasAllowance("sohm") ? (
                              <Button
                                className="stake-button"
                                variant="contained"
                                color="primary"
                                disabled={isPendingTxn(pendingTransactions, "unstaking")}
                                onClick={() => {
                                  onChangeStake("unstake");
                                }}
                              >
                                {txnButtonText(pendingTransactions, "unstaking", `${t`Unstake from`} sSTAR`)}
                              </Button>
                            ) : (
                              <Button
                                className="stake-button"
                                variant="contained"
                                color="primary"
                                disabled={isPendingTxn(pendingTransactions, "approve_unstaking")}
                                onClick={() => {
                                  onSeekApproval("sSTAR");
                                }}
                              >
                                {txnButtonText(pendingTransactions, "approve_unstaking", t`Approve Unstaking`)}
                              </Button>
                            )}
                          </Box>
                        </TabPanel>
                      </Grid>
                    </Grid>
                  </Box>
                  <Box className="stake-amount-row" display="flex" alignItems="center" justifyContent="space-between">
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item xs={10} sm={10}>
                        <FormControl className="ohm-input" variant="outlined" color="primary">
                          <InputLabel htmlFor="amount-input"></InputLabel>
                          <OutlinedInput
                            id="amount-input"
                            type="number"
                            placeholder="Enter an amount"
                            className="stake-input"
                            value={quantity}
                            onChange={handleChangeQuantity}
                            labelWidth={0}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Button
                          className="max-button"
                          variant="contained"
                          color="primary"
                          disabled={isPendingTxn(pendingTransactions, "approve_unstaking")}
                          onClick={setMax}
                        >
                          MAX
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                  <div className="stake-user-data">
                    <DataRow
                      title={t`Amount Unstaked`}
                      id="user-balance"
                      balance={`${trim(Number(ohmBalance), 4)} STAR`}
                      isLoading={isAppLoading}
                    />
                    <DataRow
                      title={t`Amount Staked`}
                      id="user-staked-balance"
                      balance={`${trimmedBalance} sSTAR`}
                      isLoading={isAppLoading}
                    />
                    <DataRow
                      title={t`Next Reward Amount`}
                      balance={`${nextRewardValue} sSTAR`}
                      isLoading={isAppLoading}
                    />
                    <DataRow
                      title={t`Next Reward Yield`}
                      balance={`${stakingRebasePercentage}%`}
                      isLoading={isAppLoading}
                    />
                    <DataRow
                      title={t`ROI (5-Day Rate)`}
                      balance={`${trim(Number(fiveDayRate) * 100, 4)}%`}
                      isLoading={isAppLoading}
                    />
                    {/*
                     */}
                  </div>
                </>
              )}
            </div>
          </Grid>
        </Paper>
      </Zoom>
      <Zoom in={true}>
        <Box width="97%">
          <div>
            <Accordion
              className="faq-accordion-root"
              expanded={expanded === "panel1"}
              onChange={handleChange("panel1")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
                <Typography>FAQ 1?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros, vitae egestas
                  augue. Duis vel est augue.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === "panel2"} onChange={handleChange("panel2")}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2bh-content" id="panel2bh-header">
                <Typography>FAQ 2?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Donec placerat, lectus sed mattis semper, neque lectus feugiat lectus, varius pulvinar diam eros in
                  elit. Pellentesque convallis laoreet laoreet.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === "panel3"} onChange={handleChange("panel3")}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3bh-content" id="panel3bh-header">
                <Typography>FAQ 3</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros, vitae egestas
                  augue. Duis vel est augue.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === "panel4"} onChange={handleChange("panel4")}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel4bh-content" id="panel4bh-header">
                <Typography>FAQ 4</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros, vitae egestas
                  augue. Duis vel est augue.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </div>
        </Box>
      </Zoom>
    </div>
  );
}

export default Stake;
