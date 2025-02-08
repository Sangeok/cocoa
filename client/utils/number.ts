export function formatCurrency(value: number): string {
  const absValue = Math.abs(value)
  
  if (absValue >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`
  }
  
  if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  
  if (absValue >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  
  return `$${value.toFixed(2)}`
} 