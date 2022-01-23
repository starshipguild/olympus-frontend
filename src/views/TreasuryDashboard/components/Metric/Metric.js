import { useSelector } from "react-redux";
import { trim, formatCurrency } from "../../../../helpers";
import { Metric } from "@olympusdao/component-library";
import { t } from "@lingui/macro";

const sharedProps = {
  labelVariant: "h6",
  metricVariant: "h5",
};

export const MarketCap = () => {
  const marketCap = useSelector(state => state.app.marketCap || 0);
  return (
    <Metric
      label={t`Market Cap`}
      metric={formatCurrency(marketCap, 0)}
      isLoading={marketCap ? false : true}
      {...sharedProps}
    />
  );
};

export const Price = () => {
  const price = 14.23;
  return (
    <Metric label={t`STAR Price`} metric={formatCurrency(price, 0)} isLoading={price ? false : true} {...sharedProps} />
  );
};

export const Backing = () => {
  const price = 7.05;
  return (
    <Metric
      label={t`Backing Per STAR`}
      metric={formatCurrency(price, 0)}
      isLoading={price ? false : true}
      {...sharedProps}
    />
  );
};

export const OHMPrice = () => {
  const marketPrice = useSelector(state => state.app.marketPrice);
  return (
    <Metric
      label={t`STAR Price`}
      metric={marketPrice && formatCurrency(marketPrice, 2)}
      isLoading={marketPrice ? false : true}
      {...sharedProps}
    />
  );
};

export const CircSupply = () => {
  const circSupply = useSelector(state => state.app.circSupply);
  const totalSupply = useSelector(state => state.app.totalSupply);
  const isDataLoaded = circSupply && totalSupply;
  return (
    <Metric
      label={t`Circulating Supply (total)`}
      metric={isDataLoaded && parseInt(circSupply) + " / " + parseInt(totalSupply)}
      isLoading={isDataLoaded ? false : true}
      {...sharedProps}
    />
  );
};

export const BackingPerOHM = () => {
  const backingPerOhm = useSelector(state => state.app.treasuryMarketValue / state.app.circSupply);
  return (
    <Metric
      label={t`Backing per STAR`}
      metric={!isNaN(backingPerOhm) && formatCurrency(backingPerOhm, 2)}
      isLoading={backingPerOhm ? false : true}
      {...sharedProps}
    />
  );
};

export const CurrentIndex = () => {
  const currentIndex = useSelector(state => state.app.currentIndex);
  return (
    <Metric
      label={t`Current Index`}
      metric={currentIndex && trim(currentIndex, 2) + " sSTAR"}
      isLoading={currentIndex ? false : true}
      {...sharedProps}
      tooltip="The current index tracks the amount of sSTAR accumulated since the beginning of staking. Basically, how much sSTAR one would have if they staked and held a single STAR from day 1."
    />
  );
};

export const GOHMPrice = () => {
  const gOhmPrice = useSelector(state => state.app.marketPrice * state.app.currentIndex);
  return (
    <Metric
      className="metric wsoprice"
      label={t`gSTAR Price`}
      metric={gOhmPrice && formatCurrency(gOhmPrice, 2)}
      isLoading={gOhmPrice ? false : true}
      {...sharedProps}
      tooltip={`gSTAR = sSTAR * index\n\nThe price of gSTAR is equal to the price of STAR multiplied by the current index`}
    />
  );
};
