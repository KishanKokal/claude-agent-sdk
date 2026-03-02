import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# --- Configuration ---
tickers = ["AAPL", "MSFT", "GOOGL"]
end_date = datetime(2026, 3, 2)
start_date = end_date - timedelta(days=6 * 30)  # ~6 months

print(f"Fetching data from {start_date.date()} to {end_date.date()}\n")

# --- 1. Fetch Adjusted Close Prices ---
raw = yf.download(tickers, start=start_date, end=end_date, auto_adjust=True, progress=False)
prices = raw["Close"]
prices.dropna(inplace=True)

print("Price Data (last 5 rows):")
print(prices.tail(), "\n")

# --- 2. Daily Returns ---
daily_returns = prices.pct_change().dropna()

# --- 3. Total Return (%) ---
total_returns = ((prices.iloc[-1] / prices.iloc[0]) - 1) * 100

# --- 4. Annualised Volatility (std of daily returns × √252) ---
volatility = daily_returns.std() * np.sqrt(252) * 100  # in %

# --- 5. Sharpe-like ratio (return / volatility, no risk-free rate for simplicity) ---
sharpe = total_returns / volatility

# --- 6. Max Drawdown ---
def max_drawdown(series):
    cumulative = (1 + series).cumprod()
    rolling_max = cumulative.cummax()
    drawdown = (cumulative - rolling_max) / rolling_max
    return drawdown.min() * 100  # in %

max_dd = {ticker: max_drawdown(daily_returns[ticker]) for ticker in tickers}

# --- 7. Correlation Matrix ---
corr_matrix = daily_returns.corr()

# -----------------------------------------------------------------------
# Summary Table
# -----------------------------------------------------------------------
summary = pd.DataFrame({
    "Total Return (%)":    total_returns.round(2),
    "Annualised Volatility (%)": volatility.round(2),
    "Return/Volatility Ratio":   sharpe.round(4),
    "Max Drawdown (%)":    pd.Series(max_dd).round(2),
    "Start Price ($)":     prices.iloc[0].round(2),
    "End Price ($)":       prices.iloc[-1].round(2),
})

print("=" * 60)
print("PERFORMANCE SUMMARY")
print("=" * 60)
print(summary.to_string())

print("\n" + "=" * 60)
print("CORRELATION MATRIX (Daily Returns)")
print("=" * 60)
print(corr_matrix.round(4).to_string())

# -----------------------------------------------------------------------
# Save to CSV
# -----------------------------------------------------------------------
output_path = "/Users/kishankokal/repos/claude-agent-sdk/tmp/comparison.csv"

# Combine summary + correlation into one CSV
with open(output_path, "w") as f:
    f.write("PERFORMANCE SUMMARY\n")
    summary.to_csv(f)
    f.write("\nCORRELATION MATRIX\n")
    corr_matrix.round(4).to_csv(f)

print(f"\n✅ Results saved to {output_path}")

# Also save daily returns for reference
returns_path = "/Users/kishankokal/repos/claude-agent-sdk/tmp/daily_returns.csv"
daily_returns.to_csv(returns_path)
print(f"✅ Daily returns saved to {returns_path}")

# -----------------------------------------------------------------------
# Print raw numbers for the assistant's analysis
# -----------------------------------------------------------------------
print("\n--- Raw values for analysis ---")
for ticker in tickers:
    print(f"{ticker}: Return={total_returns[ticker]:.2f}%  "
          f"Vol={volatility[ticker]:.2f}%  "
          f"MaxDD={max_dd[ticker]:.2f}%  "
          f"R/V={sharpe[ticker]:.4f}")
print("\nCorrelation:")
print(corr_matrix.round(4))
