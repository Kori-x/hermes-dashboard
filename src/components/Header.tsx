export function Header() {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false })
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).toUpperCase()

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">HERMES</h1>
      </div>
      <div className="header-right">
        <span className="header-label">{date}</span>
        <span className="header-label">{time}</span>
      </div>
    </header>
  )
}
