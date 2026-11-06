import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { useApp } from '../context/AppContext'
import { getVolumeOverTime } from '../utils/volume'
import { getPRs } from '../utils/prs'
import { load, save } from '../utils/storage'
import { SIZE_FIELDS } from '../data/sizeFields'
import { getSizeSeries, fromCm, fmtNum, fmtBoth, localToday, fmtSizeDate } from '../utils/size'
import SizeSheet from '../components/SizeSheet'
import SizeHistory from '../components/SizeHistory'
import styles from './Progress.module.css'

const ACCENT = '#ccff00'

const RANGES = [
  { key: '1M', months: 1 },
  { key: '3M', months: 3 },
  { key: '6M', months: 6 },
  { key: 'ALL', months: null },
]

function rangeCutoff(months) {
  if (months == null) return null
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d.toISOString().slice(0, 10)
}

function fmtVolumeTick(v) {
  return v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : v
}

const tooltipStyle = {
  contentStyle: { background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 6, fontSize: 12 },
  itemStyle: { color: ACCENT },
  labelStyle: { color: '#888' },
}

function fmtDate(dateStr) {
  const today = new Date().toISOString().slice(0, 10)
  if (dateStr === today) return 'TODAY'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

export default function Progress() {
  const { state, dispatch } = useApp()
  const [selectedId, setSelectedId] = useState('')
  const [range, setRange] = useState('3M')
  const [bwInput, setBwInput] = useState('')
  const [showBwInput, setShowBwInput] = useState(false)

  const [sizeOpen, setSizeOpen] = useState(false)
  const [openSizeDate, setOpenSizeDate] = useState(null)
  const [sizeRange, setSizeRange] = useState('ALL')
  const [sizeKey, setSizeKey] = useState(null)
  const [sizeUnit, setSizeUnit] = useState(() => (load('sizeUnit', 'cm') === 'in' ? 'in' : 'cm'))

  function changeSizeUnit(u) {
    setSizeUnit(u)
    save('sizeUnit', u)
  }

  const today = localToday()
  const todaySize = state.sizes.find((s) => s.date === today)
  // Default chart measurement: first one with any data.
  const activeSizeKey =
    sizeKey ?? SIZE_FIELDS.find(({ key }) => state.sizes.some((s) => s[key] != null))?.key ?? SIZE_FIELDS[0].key
  const sizeSeries = getSizeSeries(state.sizes, activeSizeKey).map((d) => ({
    date: d.date,
    cm: d.value,
    value: +fromCm(d.value, sizeUnit).toFixed(1),
  }))
  const sizeCutoff = rangeCutoff(RANGES.find((r) => r.key === sizeRange).months)
  const sizeChartData = sizeCutoff ? sizeSeries.filter((d) => d.date >= sizeCutoff) : sizeSeries
  const latestSize = sizeSeries.length > 0 ? sizeSeries[sizeSeries.length - 1].cm : null

  function saveSize(fields) {
    dispatch({ type: 'SAVE_SIZE', payload: { date: today, ...fields } })
    setSizeOpen(false)
    setOpenSizeDate(today)
  }

  const volumeData = selectedId ? getVolumeOverTime(state.workouts, selectedId) : []
  const prs = getPRs(state.workouts)

  const pr = selectedId ? prs[selectedId] : null
  const oneRM = pr ? pr.weight : null
  const volPR = volumeData.length > 0 ? Math.max(...volumeData.map((d) => d.volume)) : null
  const currentVolume = volumeData.length > 0 ? volumeData[volumeData.length - 1].volume : null
  const cutoff = rangeCutoff(RANGES.find((r) => r.key === range).months)
  const chartData = cutoff ? volumeData.filter((d) => d.date >= cutoff) : volumeData

  const bwData = [...state.bodyweight].sort((a, b) => a.date.localeCompare(b.date))
  const currentBw = bwData.length > 0 ? bwData[bwData.length - 1].weight : null

  const bwCutoff = new Date()
  bwCutoff.setDate(bwCutoff.getDate() - 7)
  const recentBw = bwData.filter((d) => new Date(d.date + 'T00:00:00') >= bwCutoff)
  const trend =
    recentBw.length >= 2
      ? +(recentBw[recentBw.length - 1].weight - recentBw[0].weight).toFixed(1)
      : null
  const miniChartData = bwData.slice(-7)

  function logBodyweight() {
    const w = Number(bwInput)
    if (!w) return
    dispatch({
      type: 'LOG_BODYWEIGHT',
      payload: { date: new Date().toISOString().slice(0, 10), weight: w },
    })
    setBwInput('')
    setShowBwInput(false)
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.sectionTitle}>EXERCISE METRICS</h2>
      <div className={styles.card}>
        <div className={styles.selectWrapper}>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className={styles.exerciseSelect}
          >
            <option value="">SELECT EXERCISE</option>
            {state.exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name.toUpperCase()}
              </option>
            ))}
          </select>
          <span className={styles.chevron}>▾</span>
        </div>

        {selectedId ? (
          <>
            <div className={styles.badges}>
              {oneRM !== null && (
                <span className={styles.badge}>
                  🏆 1RM: {oneRM} LBS
                </span>
              )}
              {volPR !== null && (
                <span className={styles.badge}>
                  ⭐ VOL PR: {volPR.toLocaleString()} LBS
                </span>
              )}
            </div>

            <div className={styles.chartHeader}>
              <span className={styles.chartLabel}>VOLUME OVER TIME</span>
              {currentVolume !== null && (
                <span className={styles.chartValue}>
                  {currentVolume.toLocaleString()}
                  <span className={styles.chartUnit}> LBS</span>
                </span>
              )}
            </div>

            {volumeData.length > 0 && (
              <div className={styles.rangeToggle} role="group" aria-label="Chart range">
                {RANGES.map((r) => (
                  <button
                    key={r.key}
                    className={`${styles.rangeBtn} ${range === r.key ? styles.rangeActive : ''}`}
                    onClick={() => setRange(r.key)}
                    aria-pressed={range === r.key}
                  >
                    {r.key}
                  </button>
                ))}
              </div>
            )}

            {volumeData.length === 0 ? (
              <p className={styles.empty}>No sessions logged yet.</p>
            ) : chartData.length === 0 ? (
              <p className={styles.empty}>No sessions in this range.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#2a2a2a" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={fmtDate}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={24}
                      padding={{ left: 8, right: 8 }}
                      tick={{ fontSize: 10, fill: '#666', fontWeight: 700 }}
                    />
                    <YAxis
                      width={40}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#666' }}
                      tickFormatter={fmtVolumeTick}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      labelFormatter={fmtDate}
                      formatter={(v) => [`${v.toLocaleString()} lbs`, 'Volume']}
                      cursor={{ stroke: '#3a3a3a' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="volume"
                      stroke={ACCENT}
                      strokeWidth={2}
                      dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                {chartData.length === 1 && (
                  <p className={styles.hint}>Log another session to see a trend.</p>
                )}
              </>
            )}
          </>
        ) : (
          <p className={styles.empty}>Select an exercise to view metrics.</p>
        )}
      </div>

      <h2 className={styles.sectionTitle}>BODYWEIGHT</h2>
      <div className={styles.card}>
        <div className={styles.bwCurrent}>
          <span className={styles.bwLabel}>CURRENT WEIGHT</span>
          <div className={styles.bwValue}>
            <span className={styles.bwNumber}>{currentBw ?? '—'}</span>
            <span className={styles.bwUnit}>lbs</span>
          </div>
        </div>

        {showBwInput ? (
          <div className={styles.bwInputRow}>
            <input
              type="number"
              inputMode="decimal"
              placeholder="Enter weight (lbs)"
              value={bwInput}
              onChange={(e) => setBwInput(e.target.value)}
              autoFocus
            />
            <button className={styles.saveBtn} onClick={logBodyweight}>
              Save
            </button>
          </div>
        ) : (
          <button className={styles.logWeightBtn} onClick={() => setShowBwInput(true)}>
            ⊕ LOG WEIGHT
          </button>
        )}

        {(trend !== null || miniChartData.length > 1) && (
          <div className={styles.trendRow}>
            {trend !== null && (
              <div>
                <div className={styles.trendLabel}>7-DAY TREND</div>
                <div className={`${styles.trendValue} ${trend > 0 ? styles.trendUp : styles.trendDown}`}>
                  {trend > 0 ? '↗' : '↘'} {trend > 0 ? '+' : ''}{trend} lbs
                </div>
              </div>
            )}
            {miniChartData.length > 1 && (
              <div className={styles.miniChart}>
                <ResponsiveContainer width={80} height={40}>
                  <LineChart data={miniChartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <YAxis hide domain={['dataMin', 'dataMax']} />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke={ACCENT}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>

      <h2 className={styles.sectionTitle}>SIZE</h2>
      <div className={styles.card}>
        {state.sizes.length > 0 && (
          <>
            <div className={styles.selectWrapper}>
              <select
                value={activeSizeKey}
                onChange={(e) => setSizeKey(e.target.value)}
                className={styles.exerciseSelect}
                aria-label="Measurement"
              >
                {SIZE_FIELDS.map(({ key, label }) => (
                  <option key={key} value={key}>
                    {label.toUpperCase()}
                  </option>
                ))}
              </select>
              <span className={styles.chevron}>▾</span>
            </div>

            <div className={styles.chartHeader}>
              <span className={styles.chartLabel}>LATEST</span>
              <span className={styles.sizeLatest}>{fmtBoth(latestSize)}</span>
            </div>

            {sizeSeries.length > 0 && (
              <div className={styles.rangeToggle} role="group" aria-label="Size chart range">
                {RANGES.map((r) => (
                  <button
                    key={r.key}
                    className={`${styles.rangeBtn} ${sizeRange === r.key ? styles.rangeActive : ''}`}
                    onClick={() => setSizeRange(r.key)}
                    aria-pressed={sizeRange === r.key}
                  >
                    {r.key}
                  </button>
                ))}
              </div>
            )}

            {sizeSeries.length === 0 ? (
              <p className={styles.empty}>No entries for this measurement yet.</p>
            ) : sizeChartData.length === 0 ? (
              <p className={styles.empty}>No entries in this range.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={sizeChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#2a2a2a" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={fmtSizeDate}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={24}
                      padding={{ left: 8, right: 8 }}
                      tick={{ fontSize: 10, fill: '#666', fontWeight: 700 }}
                    />
                    <YAxis
                      width={40}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#666' }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      labelFormatter={fmtSizeDate}
                      formatter={(v) => [`${fmtNum(v)} ${sizeUnit}`, SIZE_FIELDS.find((f) => f.key === activeSizeKey).label]}
                      cursor={{ stroke: '#3a3a3a' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={ACCENT}
                      strokeWidth={2}
                      dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                {sizeChartData.length === 1 && (
                  <p className={styles.hint}>Add another entry to see a trend.</p>
                )}
              </>
            )}
          </>
        )}

        <button className={styles.logWeightBtn} onClick={() => setSizeOpen(true)}>
          ⊕ ADD SIZE
        </button>

        {state.sizes.length === 0 ? (
          <p className={styles.empty}>No measurements yet.</p>
        ) : (
          <SizeHistory sizes={state.sizes} openDate={openSizeDate} onToggle={setOpenSizeDate} />
        )}
      </div>

      <SizeSheet
        open={sizeOpen}
        onClose={() => setSizeOpen(false)}
        onSave={saveSize}
        existing={todaySize}
        unit={sizeUnit}
        onUnitChange={changeSizeUnit}
      />
    </div>
  )
}
