import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import {
  useBatches,
  useSections,
  useDefaultStudents,
  useAutoCreateSections,
  useResetSections,
  useDeleteSection,
} from '../../hooks/useAcademicQueries'

export default function SectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialBatchId = searchParams.get('batchId') ?? ''

  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId)
  const [capacity, setCapacity] = useState<number>(40)

  const batchesQuery = useBatches('ACTIVE')
  const sectionsQuery = useSections(selectedBatchId || null)
  const defaultStudentsQuery = useDefaultStudents(selectedBatchId || null)

  const autoCreate = useAutoCreateSections()
  const resetSections = useResetSections()
  const deleteSection = useDeleteSection()

  // Keep URL in sync
  useEffect(() => {
    if (selectedBatchId) {
      setSearchParams({ batchId: selectedBatchId })
    }
  }, [selectedBatchId, setSearchParams])

  const batches = batchesQuery.data ?? []
  const sections = sectionsQuery.data ?? []
  const defaultStudents = defaultStudentsQuery.data ?? []

  const handleAutoCreate = () => {
    if (!selectedBatchId) return
    if (
      !window.confirm(
        `Create sections automatically with capacity ${capacity}?`,
      )
    )
      return

    autoCreate.mutate({ batchId: selectedBatchId, capacity })
  }

  const handleReset = () => {
    if (!selectedBatchId) return
    if (
      !window.confirm(
        'Reset ALL sections? Every student will move back to the default section.',
      )
    )
      return

    resetSections.mutate(selectedBatchId)
  }

  const handleDelete = (sectionId: string, name: string) => {
    if (!selectedBatchId) return
    if (
      !window.confirm(
        `Delete Section ${name}? Students will move back to default.`,
      )
    )
      return

    deleteSection.mutate({ batchId: selectedBatchId, sectionId })
  }

  return (
    <>
      {/* Batch selector */}
      <div
        className="card-head"
        style={{
          borderTop: 'none',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-faint)' }}>Batch</span>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 5,
              border: '1px solid var(--line)',
              fontSize: 13,
              minWidth: 160,
            }}
          >
            <option value="">Select a batch…</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        {selectedBatchId && (
          <span className="meta">
            {sections.length} section{sections.length !== 1 ? 's' : ''} ·{' '}
            {defaultStudents.length} unassigned
          </span>
        )}
      </div>

      {!selectedBatchId && (
        <div className="card-body">
          <p style={{ color: 'var(--ink-faint)' }}>
            Select a batch to manage its sections.
          </p>
        </div>
      )}

      {selectedBatchId && (
        <>
          {/* Actions */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12 }}>Capacity</span>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                style={{
                  width: 70,
                  padding: '4px 8px',
                  borderRadius: 5,
                  border: '1px solid var(--line)',
                  fontSize: 13,
                }}
              />
            </label>

            <button
              type="button"
              className="btn"
              disabled={autoCreate.isPending || defaultStudents.length === 0}
              onClick={handleAutoCreate}
            >
              {autoCreate.isPending ? 'Creating…' : 'Auto Create Sections'}
            </button>

            <button
              type="button"
              className="btn secondary"
              disabled={resetSections.isPending || sections.length === 0}
              onClick={handleReset}
            >
              {resetSections.isPending ? 'Resetting…' : 'Reset All Sections'}
            </button>
          </div>

          {/* Loading */}
          {(sectionsQuery.isLoading || defaultStudentsQuery.isLoading) && (
            <LoadingSpinner label="Loading sections…" />
          )}

          {/* Sections table */}
          {!sectionsQuery.isLoading && (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Students</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sections.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: 'center',
                          color: 'var(--ink-faint)',
                          fontStyle: 'italic',
                        }}
                      >
                        No sections yet. Use Auto Create to generate them.
                      </td>
                    </tr>
                  )}

                  {sections.map((sec) => (
                    <tr key={sec.id}>
                      <td className="subj-title">{sec.name}</td>
                      <td>{sec.studentCount}</td>
                      <td>
                        <span className={`status ${sec.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                          {sec.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ padding: '4px 10px', fontSize: 12 }}
                          disabled={deleteSection.isPending}
                          onClick={() => handleDelete(sec.id, sec.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Unassigned students */}
          {defaultStudents.length > 0 && (
            <div style={{ padding: 16, borderTop: '1px solid var(--line)' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>
                Unassigned Students ({defaultStudents.length})
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  maxHeight: 160,
                  overflowY: 'auto',
                }}
              >
                {defaultStudents.map((s) => (
  <span
    key={s.studentId}
    className="chip"
    title={(s as any).fullName ?? s.regNumber}
  >
    {s.regNumber}
  </span>
))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}