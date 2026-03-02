import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# ── Date range: last 6 months ──────────────────────────────────────────────
end_date   = datetime(2026, 3, 2)           # today
start_date = end_date - timedelta(days=182) # ~6 months

TICKERS = ["AAPL", "MSFT", "GOOGL"]

print(f"Fetching data from {start_date.date()} to {end_date.date()} …")

# ── 1. Fetch adjusted close prices ────────────────────────────────────────
raw    = yf.download(TICKERS, start=start_date, end=end_date, auto_adjust=True, progress=False)
prices = raw["Close"].dropna()

print(f"\nRetrieved {len(prices)} trading days of data.")
print(prices.tail(3))

# ── 2a. Total return (%) ───────────────────────────────────────────────────
total_return = ((prices.iloc[-1] - prices.iloc[0]) / prices.iloc[0] * 100).round(2)

# ── 2b. Daily returns & volatility (annualised std-dev, %) ────────────────
daily_returns  = prices.pct_change().dropna()
volatility_ann = (daily_returns.std() * np.sqrt(252) * 100).round(2)   # annualised

# ── 2c. Correlation matrix ────────────────────────────────────────────────
corr_matrix = daily_returns.corr().round(4)

# ── 2d. Bonus metrics ─────────────────────────────────────────────────────
sharpe_approx = ((daily_returns.mean() * 252) / (daily_returns.std() * np.sqrt(252))).round(2)

max_dd = {}
for t in TICKERS:
    roll_max  = prices[t].cummax()
    drawdown  = (prices[t] - roll_max) / roll_max * 100
    max_dd[t] = round(float(drawdown.min()), 2)

# ── 3. Build summary DataFrame & save ─────────────────────────────────────
summary = pd.DataFrame({
    "Start Price ($)"           : prices.iloc[0].round(2),
    "End Price ($)"             : prices.iloc[-1].round(2),
    "Total Return (%)"          : total_return,
    "Annualised Volatility (%)" : volatility_ann,
    "Approx Sharpe (0% rf)"     : sharpe_approx,
    "Max Drawdown (%)"          : pd.Series(max_dd),
})
summary.index.name = "Ticker"

out_path = "/Users/kishankokal/repos/claude-agent-sdk/tmp/comparison.csv"
with open(out_path, "w") as f:
    f.write("=== 6-Month Stock Performance Summary ===\n")
    summary.to_csv(f)
    f.write("\n=== Correlation Matrix (daily returns) ===\n")
    corr_matrix.to_csv(f)

print(f"\n✅ Results saved to {out_path}")

# ── Pretty-print results ───────────────────────────────────────────────────
sep = "=" * 62
print(f"\n{sep}")
print("       6-MONTH PERFORMANCE SUMMARY")
print(sep)
print(summary.to_string())

print(f"\n{sep}")
print("       CORRELATION MATRIX (daily returns)")
print(sep)
print(corr_matrix.to_string())

print(f"\n{sep}")
print("       RAW VALUES (for analysis)")
print(sep)
for t in TICKERS:
    print(f"  {t}:  Return={total_return[t]:>7.2f}%  "
          f"Vol={volatility_ann[t]:>6.2f}%  "
          f"Sharpe={sharpe_approx[t]:>5.2f}  "
          f"MaxDD={max_dd[t]:>7.2f}%")
