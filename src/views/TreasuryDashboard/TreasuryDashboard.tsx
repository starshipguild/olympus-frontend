import { memo, useState } from "react";
import "./treasury-dashboard.scss";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  Grid,
  Box,
  Zoom,
  Container,
  useMediaQuery,
  Typography,
  SvgIcon,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Alert from "@material-ui/lab/Alert";
import {
  MarketCap,
  Price,
  Backing,
  OHMPrice,
  GOHMPrice,
  CircSupply,
  BackingPerOHM,
  CurrentIndex,
} from "./components/Metric/Metric";
import { ReactComponent as InfoIcon } from "../../assets/icons/info-fill.svg";
import { MdDashboard } from "react-icons/md";
import { t } from "@lingui/macro";

import {
  TotalValueDepositedGraph,
  MarketValueGraph,
  RiskFreeValueGraph,
  ProtocolOwnedLiquidityGraph,
  OHMStakedGraph,
  RunwayAvailableGraph,
} from "./components/Graph/Graph";
import { MetricCollection } from "@olympusdao/component-library";
import { wETHImg } from "src/assets/tokens/wETH.svg";

const TreasuryDashboard = memo(() => {
  const isSmallScreen = useMediaQuery("(max-width: 650px)");
  const isVerySmallScreen = useMediaQuery("(max-width: 379px)");
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div id="treasury-dashboard-view" className={`${isSmallScreen && "smaller"} ${isVerySmallScreen && "very-small"}`}>
      <Container
        style={{
          paddingLeft: isSmallScreen || isVerySmallScreen ? "0" : "3.3rem",
          paddingRight: isSmallScreen || isVerySmallScreen ? "0" : "3.3rem",
        }}
      >
        <Box className="hero-metrics">
          <Paper className="ohm-card">
            <Grid className="mint-title" item xs={12}>
              <MdDashboard /> {t`Dashboard`}
            </Grid>
            <MetricCollection>
              <Paper className="ohm-card">
                <OHMPrice />
              </Paper>
              <Paper className="ohm-card">
                <MarketCap />
              </Paper>
              <Paper className="ohm-card">
                <Backing />
              </Paper>
              <Paper className="ohm-card">
                <GOHMPrice />
              </Paper>
              <Paper className="ohm-card">
                <CircSupply />
              </Paper>
              <Paper className="ohm-card">
                <BackingPerOHM />
              </Paper>
              <Paper className="ohm-card">
                <CurrentIndex />
              </Paper>
            </MetricCollection>
          </Paper>
        </Box>

        {/* <Box className="hero-metrics" style={{ marginTop: "20px" }}>
          <Alert
            variant="filled"
            icon={false}
            severity={`info`}
            // NOTE (appleseed): mui includes overflow-wrap: "break-word", but word-break: "break-word" is needed for webKit browsers
            style={{ wordBreak: "break-word" }}
          >
            <Box alignItems={"center"} display={"flex"}>
              <SvgIcon component={InfoIcon} />
              <Box width={10} />
              <Typography>
                Olympus is currently migrating to improved contracts. Please note that during this time, frontend
                metrics may be inaccurate.
              </Typography>
            </Box>
          </Alert>
        </Box>

        <Zoom in={true}>
          <Grid container spacing={2} className="data-grid">
            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <TotalValueDepositedGraph />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <MarketValueGraph />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <RiskFreeValueGraph />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <ProtocolOwnedLiquidityGraph />
              </Paper>
            </Grid>

            
            {/* <Grid item lg={6} md={12} sm={12} xs={12}>
              <Paper className="ohm-card">
                <Chart
                  type="bar"
                  data={data}
                  dataKey={["holders"]}
                  headerText="Holders"
                  stroke={[theme.palette.text.secondary]}
                  headerSubText={`${data.length > 0 && data[0].holders}`}
                  bulletpointColors={bulletpoints.holder}
                  itemNames={tooltipItems.holder}
                  itemType={undefined}
                  infoTooltipMessage={tooltipInfoMessages.holder}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                  scale={undefined}
                  color={undefined}
                  stroke={undefined}
                  dataFormat={undefined}
                  isPOL={undefined}
                  isStaked={undefined}
                />
              </Paper>
            </Grid> 

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <OHMStakedGraph />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <RunwayAvailableGraph />
              </Paper>
            </Grid>
          </Grid>
        </Zoom> */}
      </Container>
    </div>
  );
});

export default TreasuryDashboard;
