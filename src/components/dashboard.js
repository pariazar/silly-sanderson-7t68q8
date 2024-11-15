import React from "react";
import { render } from "react-dom";
import moment from "moment";
import { CRYPTO_COMPARE } from "../keys";
import { TradingViewEmbed, widgetType } from "react-tradingview-embed";

import {
  XYPlot,
  Hint,
  LineSeries,
  FlexibleXYPlot,
  VerticalBarSeries,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  AreaSeries,
} from "react-vis";

var formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    times: [],
    high: [],
    low: [],
    chartData: [],
    query: "BTC",
    leaderboard: [],
    addressData: "",
    symbol: "",
  };

  componentDidMount() {
    this.loadChartData();
  }

  loadChartData = async () => {
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/blockchain/histo/day?fsym=${this.state.query}&api_key=${CRYPTO_COMPARE}&limit=30`
    );
    const data = await response.json();
    const bulkData = data.Data.Data;
    const dataArray = [];
    {
      //this needs to be updated to time, active_addresses, average_transaction_value, current_supply, new_addresses,
      // symbol, transaction_count, transaction_count_all_time
      // bulkData.map((y) =>
      //   dataArray.push({
      //     time: y.time,
      //     active_addresses: y.active_addresses,
      //     average_transaction_value: y.average_transaction_value,
      //     current_supply: y.current_supply,
      //     symbol: y.symbol,
      //     transaction_count: y.transaction_count,
      //     transaction_count_all_time: y.transaction_count_all_time
      //   })
      // );
      bulkData.map((y) =>
        dataArray.push({
          x: y.time * 1000,
          y: y.transaction_count * y.average_transaction_value,
        })
      );
    }
    this.setState({ chartData: dataArray });
    this.setState({ symbol: this.state.query });
  };

  handleInputChange = () => {
    this.setState({
      query: this.search.value,
    });
  };
  render() {
    const { chartData, query, addressData, symbol } = this.state;

    return (
      <div>
        <div className="inputDiv">
          <input
            placeholder="Search for a symbol"
            ref={(input) => (this.search = input)}
            onChange={this.handleInputChange}
            className="dataRequest"
          />
          <button onClick={this.loadChartData} className="dataRequest">
            Load Onchain Data
          </button>
          <TradingViewEmbed
            widgetType={widgetType.TICKER_TAPE}
            widgetConfig={{
              showSymbolLogo: true,
              isTransparent: true,
              displayMode: "adaptive",
              colorTheme: "dark",
              autosize: true,
              symbols: [
                { proName: "BITSTAMP:ETHUSD", title: "ETH/USD" },
                { proName: "BITSTAMP:BTCUSD", title: "BTC/USD" },
                { proName: "BINANCE:BNBUSDT", title: "BNB/USDT" },
                { proName: "BINANCE:ADAUSD", title: "ADA/USD" },
                { proName: "BINANCE:DOTUSDT", title: "DOT/USDT" },
                { proName: "UNISWAP:UNIUSDT", title: "UNI/USDT" },
              ],
            }}
          />
        </div>

        {/* Embedded TradingView chart */}
        <div className="charty">
          <TradingViewEmbed
            widgetType={widgetType.ADVANCED_CHART}
            widgetConfig={{
              interval: "1D",
              colorTheme: "dark",
              width: "100%",
              symbol: query.length > 2 ? `${query}USD` : "BTCUSD",
              studies: [
                "MACD@tv-basicstudies",
                "StochasticRSI@tv-basicstudies",
                "TripleEMA@tv-basicstudies",
              ],
            }}
          />
        </div>

        {/* FlexibleXYPlot chart */}
        <div className="chartContainer">
          <FlexibleXYPlot className="onChainChart" height={400}>
            <VerticalBarSeries
              data={chartData}
              opacity={0.3}
              color={"#40FEFF"}
              onNearestX={(datapoint) => {
                this.setState({
                  addressData: {
                    time: new Date(datapoint.x).toLocaleDateString(),
                    price: datapoint.y,
                  },
                });
              }}
            />
            <VerticalGridLines />
            <HorizontalGridLines />
            <XAxis
              tickFormat={(value) =>
                new Date(value).toLocaleDateString().split(" ")
              }
              title="Dates"
              style={{
                line: { stroke: "#ffffff" },
                ticks: { stroke: "#ffffff" },
                text: { fill: "#ffffff", fontSize: 8 },
              }}
            />
            <YAxis
              tickFormat={(value) => value / 1}
              title="Active Number of Addresses"
              style={{
                line: { stroke: "#ffffff" },
                ticks: { stroke: "#ffffff" },
                text: { fill: "#ffffff", fontSize: 7 },
              }}
            />
          </FlexibleXYPlot>
        </div>
      </div>
    );
  }
}

const Chart = (props) => {
  return (
    <div>
      <div className="chart">
        <p className="chart-data" key={props.time}>
          {"time" + props.time}
        </p>
        <p className="chart-data" key={props.active_addresses}>
          {"active addresses" + props.active_addresses}
        </p>
        {/* <p className="chart-data">{moment(props.time * 1000).format("L")}</p>
        <p className="chart-data">{'Average Transaction ' + props.average_transaction_value}</p>
        <p className="chart-data">{'Active Addresses ' + props.active_addresses}</p>
        <p className="chart-data">{'Current Supply ' + props.current_supply}</p>
        <p className="chart-data">{'Transaction Count ' + props.transaction_count}</p>
        <p className="chart-data">{'Transaction Count All Time ' + props.transaction_count_all_time}</p> */}
      </div>
    </div>
  );
};

const Leader = (props) => {
  return (
    <div className="leaderItem">
      <a href={props.url} target="#">
        <img src={props.logo} alt={props.symbol} className="logo" />
      </a>
      <p className="leaderText">{props.symbol}</p>
      <p className="leaderText">{props.price}</p>
    </div>
  );
};

const HoverHint = ({ active, data, query, symbol }) => (
  <div className={`nonActive ${active ? "active" : ""}`}>
    <p className="hoverData">
      {data.length > 1
        ? query
        : symbol.toUpperCase() +
          "  - Raw Averaged Volume (Transactions * Average Value $USD)"}
    </p>
    <p className="hoverData">
      {data.length < 1 ? "" : data.time + " - " + formatter.format(data.price)}{" "}
    </p>
    {/* <p className="hoverData">{data.length > 1 ? "Number of Addresses" + data.price : data.price}</p> */}
  </div>
);

export default Dashboard;
