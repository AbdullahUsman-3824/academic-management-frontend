import { useState } from 'react';
import { useFaculty } from '../../../../hooks/useFacultyQueries';
import type { FacultyStatus } from '../../../../api/faculty';
import FacultyList from './components/FacultyList';
import FacultyDetail from './components/FacultyDetail';
import FacultyForm from './components/FacultyForm';

export default function FacultyPage() {
  const [statusFilter, setStatusFilter] = useState<FacultyStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const list = useFaculty({
    page,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Faculty Management</h1>
          <div className="today">Manage faculty members and teaching assignments.</div>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setCreating(true);
            setEditingId(null);
            setSelectedId(null);
          }}
        >
          + New Faculty
        </button>
      </div>

      <div className="card">
        <FacultyList
          statusFilter={statusFilter}
          setStatusFilter={(s) => {
            setStatusFilter(s);
            setPage(1);
          }}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={applySearch}
          page={page}
          setPage={setPage}
          list={list}
          onView={setSelectedId}
          onEdit={(id) => {
            setEditingId(id);
            setCreating(false);
            setSelectedId(null);
          }}
        />
      </div>

      {creating && (
        <FacultyForm mode="create" onClose={() => setCreating(false)} />
      )}
      {editingId && (
        <FacultyForm
          mode="edit"
          facultyId={editingId}
          onClose={() => setEditingId(null)}
        />
      )}
      {selectedId && !editingId && (
        <FacultyDetail
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onEdit={() => {
            setEditingId(selectedId);
            setSelectedId(null);
          }}
        />
      )}
    </>
  );
}
