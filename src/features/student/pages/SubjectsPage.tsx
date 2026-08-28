import { subjects } from '../data/mockStudent'

const totalCredits = subjects
  .reduce((sum, subject) => sum + parseFloat(subject.credits), 0)
  .toFixed(1)

function SubjectsPage() {
  return (
    <>
      <div className="topbar">
        <div>
          <h1>Subjects</h1>
          <div className="today">
            {subjects.length} subjects enrolled · {totalCredits} credit hrs
          </div>
        </div>
      </div>

      <div className="subjects-grid">
        {subjects.map((subject) => (
          <div className="card subject-card" key={subject.code}>
            <div className="card-head">
              <div>
                <div className="code">{subject.code}</div>
                <h2>{subject.title}</h2>
              </div>
              <span className="credit-pill">{subject.credits} cr</span>
            </div>
            <div className="card-body">
              <div className="subj-sub">{subject.faculty}</div>
              <p className="subject-card__description">{subject.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default SubjectsPage
