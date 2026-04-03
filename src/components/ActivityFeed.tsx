import { type ActivityEvent, timeAgo } from '../data'

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="feed">
      <div className="section-label">ACTIVITY</div>
      <div className="feed-list">
        {events.slice(0, 10).map(event => (
          <div key={event.id} className="feed-row">
            <div
              className="feed-dot"
              style={{ background: event.color || 'var(--text-disabled)' }}
            />
            <div className="feed-content">
              <span className="feed-agent">{event.agentTitle}</span>
              <span className="feed-text">{event.content}</span>
            </div>
            <span className="feed-time">{timeAgo(event.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
