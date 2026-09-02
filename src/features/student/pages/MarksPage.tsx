import { useState } from 'react'
import { marks } from '../data/mockStudent'

const categories = ['All', ...Array.from(new Set(marks.map((m) => m.category)))]

function MarksPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const filtered = activeCategory === 'All' ? marks : marks.filter((m) => m.category === activeCategory)

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Marks</h1>
          <div className="today">Marks obtained across all enrolled subjects, by assessment type.</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head results-tabs">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`tab-btn${category === activeCategory ? ' active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Assessment</th>
                <th className="col-hide-sm">Category</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="page-placeholder__todo">
                    No marks in this category yet.
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.subjectCode + entry.title}>
                    <td>
                      <div className="code">{entry.subjectCode}</div>
                      <div className="subj-sub">{entry.subjectTitle}</div>
                    </td>
                    <td className="subj-title">{entry.title}</td>
                    <td className="subj-sub col-hide-sm">{entry.category}</td>
                    <td>{entry.score}</td>
                    <td>
                      <span className={`status ${entry.status}`}>{entry.statusLabel}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default MarksPage
