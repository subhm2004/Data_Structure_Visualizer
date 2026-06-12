export const SPEED_LABELS = ['Ultra Slow', 'Slow', 'Medium', 'Fast', 'Ultra Fast']
export const SPEED_DELAYS = { 1: 800, 2: 400, 3: 150, 4: 50, 5: 10 }

export function getDelay(speed) {
  return SPEED_DELAYS[speed] || 150
}

export function getSpeedLabel(speed) {
  return SPEED_LABELS[speed - 1] || 'Medium'
}
