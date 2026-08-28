import { useState } from 'react'
import { announcements } from '../data/mockStudent'

const tags = ['All', ...Array.from(new Set(announcements.map((a) => a.tag)))]

function AnnouncementsPage() {
  const [activeTag, setActiveTag] = useState('All')
  const filtered = activeTag === 'All' ? announcements : announcements.filter((a) => a.tag === activeTag)

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Announcements</h1>
          <div className="today">General and student announcements from the institution.</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head results-tabs">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`tab-btn${tag === activeTag ? ' active' : ''}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="card-body" style={{ paddingBottom: 6 }}>
          {filtered.length === 0 ? (
            <p className="page-placeholder__todo">No announcements in this category.</p>
          ) : (
            filtered.map((item) => (
              <div className="announce" key={item.title}>
                <span className="tag-label">{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <div className="date">{item.date}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default AnnouncementsPage
