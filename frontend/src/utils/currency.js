/**
 * Format a USD salary value based on selected currency.
 * @param {number} value - Salary in USD (e.g. 125000)
 * @param {string} currency - 'USD' or 'INR'
 * @returns {string} Formatted salary string
 */
export function formatSalary(value, currency) {
  if (currency === 'INR') {
    const lakhs = (value * 0.9) / 1000
    return `\u20B9${Math.round(lakhs)} LPA`
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
    const lakhs = (value * 0.9) / 1000
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
    const minL = Math.round((range[0] * 0.9) / 1000)
    const maxL = Math.round((range[1] * 0.9) / 1000)
    return `\u20B9${minL} - \u20B9${maxL} LPA`
  }
  return `$${range[0].toLocaleString()} - $${range[1].toLocaleString()}`
}
