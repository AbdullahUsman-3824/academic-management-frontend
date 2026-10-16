import { useState } from 'react'
import { useCourses } from '../../../../hooks/useCourseQueries'
import type { CourseStatus } from '../../../../api/courses'
import CatalogTab from './components/CatalogTab'
import CourseDetail from './components/CourseDetail'
import CourseForm from './components/CourseForm'
import SemesterCoursesTab from './components/SemesterCoursesTab'
import AllocationsTab from './components/AllocationsTab'
import EnrollmentsTab from './components/EnrollmentsTab'

type MainTab = 'catalog' | 'semester-courses' | 'allocations' | 'enrollments'

export default function CoursesPage() {
  const [mainTab, setMainTab] = useState<MainTab>('catalog')
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const list = useCourses({
    page,
    search: search || undefined,
    status: statusFilter,
  })

  const applySearch = () => {
    setPage(1)
    setSearch(searchInput.trim())
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Course Management</h1>
          <div className="today">
            Course catalog, semester mappings, allocations, and enrollments.
          </div>
        </div>
        {mainTab === 'catalog' && (
          <button
            type="button"
            className="btn"
            onClick={() => {
              setCreating(true)
              setEditingId(null)
              setSelectedId(null)
            }}
          >
            + New Course
          </button>
        )}
      </div>

      <div className="card">
        <div className="tabs-row">
          {(
            [
              ['catalog', 'Catalog'],
              ['semester-courses', 'Semester Courses'],
              ['allocations', 'Allocations'],
              ['enrollments', 'Enrollments'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`tab-btn${mainTab === key ? ' active' : ''}`}
              onClick={() => setMainTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {mainTab === 'catalog' && (
          <CatalogTab
            statusFilter={statusFilter}
            setStatusFilter={(s) => {
              setStatusFilter(s)
              setPage(1)
            }}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            onSearch={applySearch}
            page={page}
            setPage={setPage}
            list={list}
            onView={setSelectedId}
            onEdit={(id) => {
              setEditingId(id)
              setCreating(false)
              setSelectedId(null)
            }}
          />
        )}

        {mainTab === 'semester-courses' && <SemesterCoursesTab />}

        {mainTab === 'allocations' && <AllocationsTab />}

        {mainTab === 'enrollments' && <EnrollmentsTab />}
      </div>

      {creating && (
        <CourseForm mode="create" onClose={() => setCreating(false)} />
      )}
      {editingId && (
        <CourseForm
          mode="edit"
          courseId={editingId}
          onClose={() => setEditingId(null)}
        />
      )}
      {selectedId && !editingId && (
        <CourseDetail
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onEdit={() => {
            setEditingId(selectedId)
            setSelectedId(null)
          }}
        />
      )}
    </>
  )
}