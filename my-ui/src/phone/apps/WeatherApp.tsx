import { useState } from 'react'

type HourlyItem = {
  time: string
  icon: string
  temp: number
}

type DailyItem = {
  day: string
  icon: string
  low: number
  high: number
}

const HOURLY_FORECAST: HourlyItem[] = [
  { time: 'Now', icon: '☀️', temp: 76 },
  { time: '1PM', icon: '☀️', temp: 78 },
  { time: '2PM', icon: '🌤️', temp: 81 },
  { time: '3PM', icon: '🌤️', temp: 82 },
  { time: '4PM', icon: '⛅', temp: 79 },
  { time: '5PM', icon: '⛅', temp: 77 },
  { time: '6PM', icon: '🌅', temp: 74 },
  { time: '7PM', icon: '🌙', temp: 70 },
]

const DAILY_FORECAST: DailyItem[] = [
  { day: 'Today', icon: '☀️', low: 64, high: 82 },
  { day: 'Mon', icon: '🌤️', low: 66, high: 84 },
  { day: 'Tue', icon: '⛅', low: 63, high: 79 },
  { day: 'Wed', icon: '🌧️', low: 60, high: 72 },
  { day: 'Thu', icon: '🌦️', low: 61, high: 75 },
  { day: 'Fri', icon: '☀️', low: 65, high: 83 },
  { day: 'Sat', icon: '☀️', low: 67, high: 86 },
]

export function WeatherApp() {
  const [selectedCity] = useState('Sun City')
  const [currentTemp] = useState(76)
  const [condition] = useState('Sunny')
  const [high] = useState(82)
  const [low] = useState(64)

  return (
    <div className="weather-container" aria-label="Weather">
      {/* Top Main Hero */}
      <div className="weather-hero">
        <h2 className="weather-city-name">{selectedCity}</h2>
        <div className="weather-temp-display">{currentTemp}°</div>
        <p className="weather-condition-label">{condition}</p>
        <span className="weather-hi-lo">H: {high}°  L: {low}°</span>
      </div>

      {/* Hourly Strip */}
      <div className="weather-card weather-hourly-card">
        <p className="weather-card-caption">HOURLY FORECAST</p>
        <div className="weather-hourly-list">
          {HOURLY_FORECAST.map((item, index) => (
            <div key={index} className="weather-hourly-col">
              <span className="weather-hourly-time">{item.time}</span>
              <span className="weather-hourly-icon">{item.icon}</span>
              <strong className="weather-hourly-temp">{item.temp}°</strong>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="weather-card weather-daily-card">
        <p className="weather-card-caption">7-DAY FORECAST</p>
        <div className="weather-daily-list">
          {DAILY_FORECAST.map((day, index) => (
            <div key={index} className="weather-daily-row">
              <span className="weather-daily-name">{day.day}</span>
              <span className="weather-daily-icon">{day.icon}</span>
              <div className="weather-daily-bar-container">
                <span className="weather-daily-low">{day.low}°</span>
                <div className="weather-daily-bar">
                  <div
                    className="weather-daily-bar-fill"
                    style={{
                      left: `${((day.low - 55) / 35) * 100}%`,
                      width: `${((day.high - day.low) / 35) * 100}%`,
                    }}
                  />
                </div>
                <span className="weather-daily-high">{day.high}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Atmospheric Grid */}
      <div className="weather-details-grid">
        <div className="weather-metric-card">
          <small>UV INDEX</small>
          <strong>4</strong>
          <span>Moderate</span>
        </div>
        <div className="weather-metric-card">
          <small>WIND</small>
          <strong>9 mph</strong>
          <span>NW gusts to 14 mph</span>
        </div>
        <div className="weather-metric-card">
          <small>HUMIDITY</small>
          <strong>48%</strong>
          <span>The dew point is 56°</span>
        </div>
        <div className="weather-metric-card">
          <small>VISIBILITY</small>
          <strong>10 mi</strong>
          <span>Perfect clarity</span>
        </div>
        <div className="weather-metric-card">
          <small>AIR QUALITY</small>
          <strong>32</strong>
          <span>AQI - Good</span>
        </div>
        <div className="weather-metric-card">
          <small>PRESSURE</small>
          <strong>30.04</strong>
          <span>inHg</span>
        </div>
      </div>
    </div>
  )
}
