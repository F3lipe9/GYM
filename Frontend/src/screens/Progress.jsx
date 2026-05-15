import { useState } from 'react'
import { BarChart, Bar, Cell, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useApp } from '../context/AppContext'
import { getVolumeOverTime } from '../utils/volume'
import { getPRs } from '../utils/prs'
import styles from './Progress.module.css'

function fmtDate(dateStr) {
  const today = new Date().toISOString().slice(0, 10)
  if (dateStr === today) return 'TODAY'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

export default function Progress() {
  const { state, dispatch } = useApp()
  const [selectedId, setSelectedId] = useState('')
  const [bwInput, setBwInput] = useState('')
  const [showBwInput, setShowBwInput] = useState(false)

  const volumeData = selectedId ? getVolumeOverTime(state.workouts, selectedId) : []
  const prs = getPRs(state.workouts)

  const pr = selectedId ? prs[selectedId] : null
  const oneRM = pr ? pr.weight : null
  const volPR = volumeData.length > 0 ? Math.max(...volumeData.map((d) => d.volume)) : null
  const currentVolume = volumeData.length > 0 ? volumeData[volumeData.length - 1].volume : null
  const chartData = volumeData.slice(-5)

  const bwData = [...state.bodyweight].sort((a, b) => a.date.localeCompare(b.date))
  const currentBw = bwData.length > 0 ? bwData[bwData.length - 1].weight : null

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const recentBw = bwData.filter((d) => new Date(d.date + 'T00:00:00') >= cutoff)
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
              <span className={styles.chartLabel}>VOLUME HISTORY</span>
              {currentVolume !== null && (
                <span className={styles.chartValue}>
                  {currentVolume.toLocaleString()}
                  <span className={styles.chartUnit}> LBS</span>
                </span>
              )}
            </div>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barCategoryGap="25%">
                  <XAxis
                    dataKey="date"
                    tickFormatter={fmtDate}
                    tick={(props) => <CustomTick {...props} last={chartData.length - 1} />}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 6, fontSize: 12 }}
                    itemStyle={{ color: 'var(--accent)' }}
                    labelFormatter={fmtDate}
                    cursor={false}
                  />
                  <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i === chartData.length - 1 ? 'var(--accent)' : '#3a3a3a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className={styles.empty}>No sessions logged yet.</p>
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
                  <BarChart data={miniChartData} barCategoryGap="15%">
                    <Bar dataKey="weight" radius={[2, 2, 0, 0]}>
                      {miniChartData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={i === miniChartData.length - 1 ? 'var(--accent)' : '#3a3a3a'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CustomTick({ x, y, payload, last }) {
  const isLast = payload.index === last
  return (
    <text
      x={x}
      y={y + 12}
      textAnchor="middle"
      fontSize={10}
      fontWeight={700}
      fill={isLast ? 'var(--accent)' : '#666'}
    >
      {fmtDate(payload.value)}
    </text>
  )
}
