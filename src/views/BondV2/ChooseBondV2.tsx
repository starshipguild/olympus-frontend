import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  ButtonBase,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Zoom,
  SvgIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { t, Trans } from "@lingui/macro";
import { BondDataCard, BondTableData } from "./BondRow";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { formatCurrency } from "../../helpers";
import useBonds from "../../hooks/Bonds";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { usePathForNetwork } from "src/hooks/usePathForNetwork";
import "./choosebond.scss";
import { Skeleton } from "@material-ui/lab";
import ClaimBonds from "./ClaimBonds";
import isEmpty from "lodash/isEmpty";
import { allBondsMap } from "src/helpers/AllBonds";
import { useAppSelector, useWeb3Context } from "src/hooks";
import { IUserBondDetails } from "src/slices/AccountSlice";
import { Metric, MetricCollection } from "@olympusdao/component-library";
import { getAllBonds, getUserNotes, IBondV2, IUserNote } from "src/slices/BondSliceV2";
import { ReactComponent as ArrowUp } from "../../assets/icons/arrow-up.svg";
import { useEffect, useState } from "react";
import { AppDispatch } from "src/store";
import { IoLeaf } from "react-icons/io5";

function ChooseBondV2() {
  const { networkId, address, provider } = useWeb3Context();
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();
  usePathForNetwork({ pathName: "bonds", networkID: networkId, history });
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const bondsV2 = useAppSelector(state => {
    return state.bondingV2.indexes.map(index => state.bondingV2.bonds[index]);
  });

  const isSmallScreen = useMediaQuery("(max-width: 733px)"); // change to breakpoint query
  const accountNotes: IUserNote[] = useAppSelector(state => state.bondingV2.notes);

  const marketPrice: number | undefined = useAppSelector(state => {
    return state.app.marketPrice;
  });
  const circSupply: number | undefined = useAppSelector(state => {
    return state.app.circSupply;
  });
  const treasuryMarketValue: number | undefined = useAppSelector(state => {
    return state.app.treasuryMarketValue;
  });
  let backingPerOhm = 0;
  const treasuryBalance = useAppSelector(state => state.app.treasuryMarketValue);
  if (treasuryMarketValue && circSupply) {
    backingPerOhm = treasuryMarketValue / circSupply;
  }

  const formattedTreasuryBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Number(treasuryBalance));

  useEffect(() => {
    const interval = setTimeout(() => {
      dispatch(getAllBonds({ address, networkID: networkId, provider }));
      dispatch(getUserNotes({ address, networkID: networkId, provider }));
    }, 60000);
    return () => clearTimeout(interval);
  });

  const v1AccountBonds: IUserBondDetails[] = useAppSelector(state => {
    const withInterestDue = [];
    for (const bond in state.account.bonds) {
      if (state.account.bonds[bond].interestDue > 0) {
        withInterestDue.push(state.account.bonds[bond]);
      }
    }
    return withInterestDue;
  });

  return (
    <div id="choose-bond-view">
      {(!isEmpty(accountNotes) || !isEmpty(v1AccountBonds)) && <ClaimBonds activeNotes={accountNotes} />}

      <Zoom in={true}>
        <Paper className="ohm-card">
          <Box className="card-header">
            <span className="section-icon">
              <IoLeaf />
            </span>
            <span className="section-title">{t`Mint`}</span>
          </Box>

          <MetricCollection>
            <Metric
              label={t`STAR Price`}
              metric={formatCurrency(Number(marketPrice), 2)}
              isLoading={marketPrice ? false : true}
            />
            <Metric
              label={t`Backing per STAR`}
              metric={!isNaN(backingPerOhm) ? formatCurrency(backingPerOhm, 2) : undefined}
              isLoading={backingPerOhm ? false : true}
            />
          </MetricCollection>

          {!isSmallScreen && (
            <Grid container item>
              <TableContainer>
                <Table className="bond-table" aria-label="Available bonds">
                  <TableBody>
                    {bondsV2.map(bond => {
                      if (bond.displayName !== "unknown") return <BondTableData key={bond.index} bond={bond} />;
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
          <div className="help-text">
            <em>
              <Typography variant="body2">
                Important: New bonds are auto-staked (accrue rebase rewards) and no longer vest linearly. Simply claim
                as sSTAR at the end of the term.
              </Typography>
            </em>
          </div>
        </Paper>
      </Zoom>

      {isSmallScreen && (
        <Box className="ohm-card-container">
          <Grid container item spacing={2}>
            {bondsV2.map(bond => {
              return (
                <Grid item xs={12} key={bond.index}>
                  <BondDataCard key={bond.index} bond={bond} />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      <Zoom in={true}>
        <Box width="97%">
          <div>
            <Accordion
              className="faq-accordion-root"
              expanded={expanded === "panel1"}
              onChange={handleChange("panel1")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
                <Typography>Why Mint?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Minting allows you to buy $STAR at a discount from the market price. You can use a variety of
                  different cryptocurrencies to mint $STAR. After minting, you will receive $STAR after a five day
                  waiting period. Using the minting process, the Starship treasury is able to raise money to deploy into
                  the metaverse. In exchange, the treasury will give you a discount depending on what type of
                  cryptocurrency you pay with. Learn more in our docs.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === "panel2"} onChange={handleChange("panel2")}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2bh-content" id="panel2bh-header">
                <Typography>How is ROI determinted?</Typography>
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
                <Typography>Is it better to mint or stake?</Typography>
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
                <Typography>How is the treasury deployed in the metaverse?</Typography>
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

export default ChooseBondV2;
