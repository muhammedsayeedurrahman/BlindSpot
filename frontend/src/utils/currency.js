/**
 * Regional salary conversion.
 * Backend salary data is US-market (USD). When displaying INR, we apply
 * a purchasing-power-adjusted ratio so values reflect real Indian salaries
 * rather than a naive exchange-rate conversion.
 *
 * India tech salaries ≈ 20% of US equivalents in absolute terms.
 * Combined with ₹83/USD, this gives realistic LPA figures:
 *   $125,000 (US SWE) → ₹21 LPA (India SWE)  ✓
 *   $150,000 (US AI)  → ₹25 LPA (India AI)    ✓
 *   $85,000  (US DA)  → ₹14 LPA (India DA)    ✓
 */
const INR_PER_USD = 83
const INDIA_PPP_RATIO = 0.20

function usdToInrLakhs(usdValue) {
  return (usdValue * INDIA_PPP_RATIO * INR_PER_USD) / 100000
}

/**
 * Format a USD salary value based on selected currency.
 * @param {number} value - Salary in USD (e.g. 125000)
 * @param {string} currency - 'USD' or 'INR'
 * @returns {string} Formatted salary string
 */
export function formatSalary(value, currency) {
  if (currency === 'INR') {
    const lakhs = usdToInrLakhs(value)
    return `\u20B9${lakhs.toFixed(1)} LPA`
  }
  return `$${value.toLocaleString()}`
}

/**
 * Format salary for chart axis ticks (compact form).
 * @param {number} value - Salary in USD
 * @param {string} currency - 'USD' or 'INR'
 * @returns {string} Compact formatted salary
 */
export function formatSalaryCompact(value, currency) {
  if (currency === 'INR') {
    const lakhs = usdToInrLakhs(value)
    return `\u20B9${Math.round(lakhs)}L`
  }
  return `$${(value / 1000).toFixed(0)}k`
}

/**
 * Format a salary range [min, max].
 * @param {number[]} range - [min, max] in USD
 * @param {string} currency - 'USD' or 'INR'
 * @returns {string} Formatted range string
 */
export function formatSalaryRange(range, currency) {
  if (currency === 'INR') {
    const minL = usdToInrLakhs(range[0]).toFixed(1)
    const maxL = usdToInrLakhs(range[1]).toFixed(1)
    return `\u20B9${minL} - \u20B9${maxL} LPA`
  }
  return `$${range[0].toLocaleString()} - $${range[1].toLocaleString()}`
}
