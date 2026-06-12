import { getSpeedLabel } from '../utils/speed'

export default function SpeedControl({ speed, onChange, disabled = false }) {
  return (
    <div className="panel">
      <div className="panel-title">Animation Speed</div>
      <div className="control-row">
        <label>Speed</label>
        <span className="control-value">{getSpeedLabel(speed)}</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={speed}
        disabled={disabled}
        onChange={e => onChange(+e.target.value)}
      />
    </div>
  )
}
