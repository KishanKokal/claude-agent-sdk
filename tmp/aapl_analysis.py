"""
Apple (AAPL) Stock Performance Analysis
Analyzes the last 3 months of AAPL stock data using yfinance.
"""

import yfinance as yf
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta

# --- Configuration ---
TICKER = "AAPL"
END_DATE = datetime.today()
START_DATE = END_DATE - timedelta(days=90)
OUTPUT_PATH = "/Users/kishankokal/repos/claude-agent-sdk/tmp/aapl_analysis_results.json"

print(f"Fetching {TICKER} data from {START_DATE.date()} to {END_DATE.date()}...")

# --- 1. Fetch Stock Data ---
stock = yf.Ticker(TICKER)
df = stock.history(start=START_DATE.strftime("%Y-%m-%d"), end=END_DATE.strftime("%Y-%m-%d"))

if df.empty:
    raise ValueError("No data returned. Check ticker or date range.")

df.index = df.index.tz_localize(None)  # Remove timezone for clean serialization
print(f"Fetched {len(df)} trading days of data.\n")

# --- 2. Calculate Basic Statistics ---

# Closing prices
close = df["Close"]

# Mean / Min / Max price
mean_price   = close.mean()
min_price    = close.min()
max_price    = close.max()
min_date     = close.idxmin().strftime("%Y-%m-%d")
max_date     = close.idxmax().strftime("%Y-%m-%d")

# Total return (first close → last close)
start_price  = close.iloc[0]
end_price    = close.iloc[-1]
total_return = (end_price - start_price) / start_price * 100  # %

# Daily returns
daily_returns = close.pct_change().dropna()

# Volatility — annualized standard deviation of daily returns
daily_vol      = daily_returns.std()
annualized_vol = daily_vol * np.sqrt(252) * 100  # %

# Average daily volume
avg_volume = df["Volume"].mean()

# Sharpe-like ratio (excess return / volatility, assuming 0 risk-free rate for simplicity)
avg_daily_return = daily_returns.mean()
sharpe_ratio     = (avg_daily_return / daily_vol) * np.sqrt(252) if daily_vol != 0 else 0

# Best and worst single-day returns
best_day_return  = daily_returns.max() * 100
worst_day_return = daily_returns.min() * 100
best_day_date    = daily_returns.idxmax().strftime("%Y-%m-%d")
worst_day_date   = daily_returns.idxmin().strftime("%Y-%m-%d")

# Price momentum: 30-day moving average vs current price
ma_30 = close.rolling(window=30).mean().iloc[-1]
momentum_signal = "BULLISH" if end_price > ma_30 else "BEARISH"

# --- 3. Build Results Dictionary ---
results = {
    "ticker": TICKER,
    "analysis_date": datetime.today().strftime("%Y-%m-%d"),
    "period": {
        "start": START_DATE.strftime("%Y-%m-%d"),
        "end":   END_DATE.strftime("%Y-%m-%d"),
        "trading_days": len(df),
    },
    "price_statistics": {
        "start_price_usd":  round(start_price, 2),
        "end_price_usd":    round(end_price, 2),
        "mean_price_usd":   round(mean_price, 2),
        "min_price_usd":    round(min_price, 2),
        "min_price_date":   min_date,
        "max_price_usd":    round(max_price, 2),
        "max_price_date":   max_date,
        "price_range_usd":  round(max_price - min_price, 2),
    },
    "returns": {
        "total_return_pct":      round(total_return, 4),
        "avg_daily_return_pct":  round(avg_daily_return * 100, 4),
        "best_day_return_pct":   round(best_day_return, 4),
        "best_day_date":         best_day_date,
        "worst_day_return_pct":  round(worst_day_return, 4),
        "worst_day_date":        worst_day_date,
    },
    "risk_metrics": {
        "daily_volatility_pct":      round(daily_vol * 100, 4),
        "annualized_volatility_pct": round(annualized_vol, 4),
        "sharpe_ratio_annualized":   round(sharpe_ratio, 4),
    },
    "volume": {
        "avg_daily_volume": int(avg_volume),
    },
    "momentum": {
        "30d_moving_avg_usd": round(ma_30, 2),
        "current_vs_30d_ma":  momentum_signal,
    },
}

# --- 4. Save to JSON ---
with open(OUTPUT_PATH, "w") as f:
    json.dump(results, f, indent=4)

print(f"Results saved to: {OUTPUT_PATH}\n")

# --- 5. Print Summary ---
print("=" * 55)
print(f"  AAPL 3-Month Performance Summary")
print("=" * 55)
print(f"  Period          : {results['period']['start']}  →  {results['period']['end']}")
print(f"  Trading Days    : {results['period']['trading_days']}")
print(f"  Start Price     : ${results['price_statistics']['start_price_usd']:.2f}")
print(f"  End Price       : ${results['price_statistics']['end_price_usd']:.2f}")
print(f"  Mean Price      : ${results['price_statistics']['mean_price_usd']:.2f}")
print(f"  52W Range       : ${results['price_statistics']['min_price_usd']:.2f}  –  ${results['price_statistics']['max_price_usd']:.2f}")
print(f"  Total Return    : {results['returns']['total_return_pct']:+.2f}%")
print(f"  Avg Daily Rtn   : {results['returns']['avg_daily_return_pct']:+.4f}%")
print(f"  Best Day        : {results['returns']['best_day_date']}  ({results['returns']['best_day_return_pct']:+.2f}%)")
print(f"  Worst Day       : {results['returns']['worst_day_date']}  ({results['returns']['worst_day_return_pct']:+.2f}%)")
print(f"  Ann. Volatility : {results['risk_metrics']['annualized_volatility_pct']:.2f}%")
print(f"  Sharpe Ratio    : {results['risk_metrics']['sharpe_ratio_annualized']:.2f}")
print(f"  Avg Volume      : {results['volume']['avg_daily_volume']:,}")
print(f"  30d MA          : ${results['momentum']['30d_moving_avg_usd']:.2f}  →  {results['momentum']['current_vs_30d_ma']}")
print("=" * 55)
