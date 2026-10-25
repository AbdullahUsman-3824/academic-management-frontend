// import { useState } from 'react'
// import { LoadingSpinner } from '../../components/LoadingSpinner'
// import {
//   useProgressionCheck,
//   useStartProgression,
//   useProgressionPreview,
// } from '../../hooks/useAcademicQueries'
// import { progressionApi } from '../../api/academic' // adjust path
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// type Step =
//   | 'start'
//   | 'preview'
//   | 'with-record'
//   | 'semester'
//   | 'sections'
//   | 'final'
//   | 'done'

// const STEPS: { key: Step; label: string }[] = [
//   { key: 'preview', label: '1. Preview' },
//   { key: 'with-record', label: '2. With Record' },
//   { key: 'semester', label: '3. Semester' },
//   { key: 'sections', label: '4. Sections' },
//   { key: 'final', label: '5. Final Preview' },
//   { key: 'done', label: '6. Locked' },
// ]

// export default function ProgressionPage() {
//   const qc = useQueryClient()
//   const [progressionId, setProgressionId] = useState<string | null>(null)
//   const [step, setStep] = useState<Step>('start')

//   const [withRecordMode, setWithRecordMode] = useState<'auto' | 'manual'>('auto')
//   const [defaultSemester, setDefaultSemester] = useState(1)
//   const [sectionStrategy, setSectionStrategy] = useState<
//     'single' | 'split_50_50'
//   >('single')

//   const checkQuery = useProgressionCheck()
//   const startMutation = useStartProgression()
//   const previewQuery = useProgressionPreview(progressionId)

//   const confirmWithRecord = useMutation({
//     mutationFn: () =>
//       progressionApi.confirmWithRecord(progressionId!, {
//         mode: withRecordMode,
//       }),
//     onSuccess: () => setStep('semester'),
//   })

//   const assignSemester = useMutation({
//     mutationFn: () =>
//       progressionApi.assignSemester(progressionId!, {
//         defaultSemester,
//       }),
//     onSuccess: () => setStep('sections'),
//   })

//   const assignSections = useMutation({
//     mutationFn: () =>
//       progressionApi.assignSections(progressionId!, {
//         strategy: sectionStrategy,
//       }),
//     onSuccess: () => {
//       setStep('final')
//       finalPreview.refetch()
//     },
//   })

//   const finalPreview = useQuery({
//     queryKey: ['progression-final', progressionId],
//     queryFn: () => progressionApi.getFinalPreview(progressionId!),
//     enabled: !!progressionId && step === 'final',
//   })

//   const lockMutation = useMutation({
//     mutationFn: () => progressionApi.lock(progressionId!),
//     onSuccess: () => {
//       setStep('done')
//       qc.invalidateQueries({ queryKey: ['progression-check'] })
//     },
//   })

//   const handleStart = async () => {
//     const sessionId = checkQuery.data?.activeSession?.id
//     if (!sessionId) return
//     const result = await startMutation.mutateAsync(sessionId)
//     setProgressionId(result.id)
//     setStep('preview')
//   }

//   const handleContinue = () => {
//     if (!checkQuery.data?.existingProgression) return
//     const existing = checkQuery.data.existingProgression
//     setProgressionId(existing.id)

//     const status = existing.status
//     if (status === 'draft') setStep('preview')
//     else if (status === 'with_record_done') setStep('semester')
//     else if (status === 'semester_assigned') setStep('sections')
//     else if (status === 'sections_assigned' || status === 'final_preview')
//       setStep('final')
//     else if (status === 'locked') setStep('done')
//     else setStep('preview')
//   }

//   if (checkQuery.isLoading) {
//     return <LoadingSpinner label="Checking progression status…" />
//   }

//   if (checkQuery.isError) {
//     return (
//       <div className="card-body">
//         <p style={{ color: 'crimson' }}>Failed to check progression.</p>
//         <button className="btn secondary" onClick={() => checkQuery.refetch()}>
//           Retry
//         </button>
//       </div>
//     )
//   }

//   const check = checkQuery.data!

//   if (!check.canStart && !progressionId) {
//     return (
//       <div className="card-body">
//         <h3 style={{ marginTop: 0 }}>Progression Not Available</h3>
//         <p style={{ color: 'var(--ink-faint)' }}>
//           {check.reason ?? 'No active session ready for progression.'}
//         </p>
//       </div>
//     )
//   }

//   // ── Start screen ───────────────────────────────────────
//   if (step === 'start' && !progressionId) {
//     return (
//       <div className="card-body">
//         <h3 style={{ marginTop: 0 }}>Academic Progression</h3>

//         {check.existingProgression ? (
//           <>
//             <p>
//               An existing progression was found.
//               <br />
//               Status: <strong>{check.existingProgression.status}</strong>
//             </p>
//             <button type="button" className="btn" onClick={handleContinue}>
//               Continue Progression
//             </button>
//           </>
//         ) : (
//           <>
//             <p>
//               Active session: <strong>{check.activeSession?.name}</strong>
//             </p>
//             <p style={{ color: 'var(--ink-faint)', marginBottom: 16 }}>
//               This will promote students into the new session, assign semesters
//               and sections.
//             </p>
//             <button
//               type="button"
//               className="btn"
//               disabled={startMutation.isPending}
//               onClick={handleStart}
//             >
//               {startMutation.isPending ? 'Starting…' : 'Start Progression'}
//             </button>
//           </>
//         )}
//       </div>
//     )
//   }

//   const currentStepIndex = STEPS.findIndex((s) => s.key === step)

//   return (
//     <div className="card-body">
//       {/* Stepper */}
//       <div
//         style={{
//           display: 'flex',
//           gap: 8,
//           marginBottom: 24,
//           flexWrap: 'wrap',
//         }}
//       >
//         {STEPS.map((s, i) => (
//           <div
//             key={s.key}
//             style={{
//               padding: '6px 14px',
//               borderRadius: 20,
//               fontSize: 12,
//               fontWeight: 600,
//               background:
//                 i === currentStepIndex
//                   ? 'var(--brand, #1a5c3a)'
//                   : i < currentStepIndex
//                     ? '#e8f5e9'
//                     : 'var(--surface-2, #f0f0f0)',
//               color:
//                 i === currentStepIndex
//                   ? '#fff'
//                   : i < currentStepIndex
//                     ? '#2e7d32'
//                     : 'var(--ink-faint)',
//             }}
//           >
//             {s.label}
//           </div>
//         ))}
//       </div>

//       {/* ── 1. PREVIEW ──────────────────────────────────── */}
//       {step === 'preview' && (
//         <>
//           {previewQuery.isLoading && (
//             <LoadingSpinner label="Loading preview…" />
//           )}
//           {previewQuery.data && (
//             <>
//               <h3 style={{ marginTop: 0 }}>Step 1 — Preview</h3>

//               <div
//                 style={{
//                   display: 'grid',
//                   gridTemplateColumns: '1fr 1fr',
//                   gap: 16,
//                   marginBottom: 20,
//                 }}
//               >
//                 <div className="stat-card">
//                   <div className="stat-label">With previous record</div>
//                   <div className="stat-value">
//                     {previewQuery.data.totalWithRecord}
//                   </div>
//                 </div>
//                 <div className="stat-card">
//                   <div className="stat-label">New students</div>
//                   <div className="stat-value">
//                     {previewQuery.data.totalWithoutRecord}
//                   </div>
//                 </div>
//               </div>

//               <div className="table-scroll">
//                 <table>
//                   <thead>
//                     <tr>
//                       <th>Batch</th>
//                       <th>With Record</th>
//                       <th>Without Record</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {previewQuery.data.batches.map((b) => (
//                       <tr key={b.batchId}>
//                         <td className="subj-title">{b.batchName}</td>
//                         <td>{b.withRecordCount}</td>
//                         <td>{b.withoutRecordCount}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               <button
//                 type="button"
//                 className="btn"
//                 style={{ marginTop: 16 }}
//                 onClick={() => setStep('with-record')}
//               >
//                 Next → With Record Decision
//               </button>
//             </>
//           )}
//         </>
//       )}

//       {/* ── 2. WITH RECORD ──────────────────────────────── */}
//       {step === 'with-record' && (
//         <>
//           <h3 style={{ marginTop: 0 }}>Step 2 — Students With Record</h3>
//           <p style={{ color: 'var(--ink-faint)' }}>
//             How should existing students progress to the next semester?
//           </p>

//           <div style={{ display: 'flex', gap: 16, margin: '16px 0' }}>
//             <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//               <input
//                 type="radio"
//                 checked={withRecordMode === 'auto'}
//                 onChange={() => setWithRecordMode('auto')}
//               />
//               Auto (semester +1)
//             </label>
//             <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//               <input
//                 type="radio"
//                 checked={withRecordMode === 'manual'}
//                 onChange={() => setWithRecordMode('manual')}
//               />
//               Manual adjustments
//             </label>
//           </div>

//           <button
//             type="button"
//             className="btn"
//             disabled={confirmWithRecord.isPending}
//             onClick={() => confirmWithRecord.mutate()}
//           >
//             {confirmWithRecord.isPending ? 'Saving…' : 'Confirm & Next'}
//           </button>
//         </>
//       )}

//       {/* ── 3. SEMESTER ─────────────────────────────────── */}
//       {step === 'semester' && (
//         <>
//           <h3 style={{ marginTop: 0 }}>
//             Step 3 — Assign Semester (New Students)
//           </h3>
//           <p style={{ color: 'var(--ink-faint)' }}>
//             Default semester number for students who have no previous academic
//             record.
//           </p>

//           <label style={{ display: 'block', margin: '16px 0' }}>
//             <span style={{ fontSize: 13 }}>Default Semester</span>
//             <input
//               type="number"
//               min={1}
//               max={16}
//               value={defaultSemester}
//               onChange={(e) => setDefaultSemester(Number(e.target.value))}
//               style={{
//                 display: 'block',
//                 marginTop: 6,
//                 padding: '6px 10px',
//                 borderRadius: 5,
//                 border: '1px solid var(--line)',
//                 width: 80,
//                 fontSize: 14,
//               }}
//             />
//           </label>

//           <button
//             type="button"
//             className="btn"
//             disabled={assignSemester.isPending}
//             onClick={() => assignSemester.mutate()}
//           >
//             {assignSemester.isPending ? 'Saving…' : 'Confirm & Next'}
//           </button>
//         </>
//       )}

//       {/* ── 4. SECTIONS ─────────────────────────────────── */}
//       {step === 'sections' && (
//         <>
//           <h3 style={{ marginTop: 0 }}>
//             Step 4 — Section Strategy (New Students)
//           </h3>
//           <p style={{ color: 'var(--ink-faint)' }}>
//             How should new students be distributed into sections?
//           </p>

//           <div
//             style={{
//               display: 'flex',
//               flexDirection: 'column',
//               gap: 10,
//               margin: '16px 0',
//             }}
//           >
//             <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//               <input
//                 type="radio"
//                 checked={sectionStrategy === 'single'}
//                 onChange={() => setSectionStrategy('single')}
//               />
//               Single (all in default section)
//             </label>
//             <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//               <input
//                 type="radio"
//                 checked={sectionStrategy === 'split_50_50'}
//                 onChange={() => setSectionStrategy('split_50_50')}
//               />
//               Split 50/50 (Section A & B)
//             </label>
//           </div>

//           <button
//             type="button"
//             className="btn"
//             disabled={assignSections.isPending}
//             onClick={() => assignSections.mutate()}
//           >
//             {assignSections.isPending ? 'Saving…' : 'Confirm & Next'}
//           </button>
//         </>
//       )}

//       {/* ── 5. FINAL PREVIEW (polished with tables) ─────── */}
//       {step === 'final' && (
//         <>
//           <h3 style={{ marginTop: 0 }}>Step 5 — Final Preview</h3>
//           <p style={{ color: 'var(--ink-faint)', marginBottom: 16 }}>
//             Review everything carefully. Clicking <strong>Lock</strong> will
//             write permanent academic records.
//           </p>

//           {finalPreview.isLoading && (
//             <LoadingSpinner label="Loading final preview…" />
//           )}

//           {finalPreview.data && (
//             <>
//               {/* Summary cards */}
//               <div
//                 style={{
//                   display: 'grid',
//                   gridTemplateColumns: '1fr 1fr',
//                   gap: 16,
//                   marginBottom: 20,
//                 }}
//               >
//                 <div className="stat-card">
//                   <div className="stat-label">With previous record</div>
//                   <div className="stat-value">
//                     {(finalPreview.data as any).totalWithRecord ?? 0}
//                   </div>
//                 </div>
//                 <div className="stat-card">
//                   <div className="stat-label">New students</div>
//                   <div className="stat-value">
//                     {(finalPreview.data as any).totalWithoutRecord ?? 0}
//                   </div>
//                 </div>
//               </div>

//               {/* Batch breakdown tables */}
//               {((finalPreview.data as any).batches ?? []).map((batch: any) => (
//                 <div key={batch.batchId} style={{ marginBottom: 24 }}>
//                   <h4 style={{ margin: '0 0 8px', fontSize: 15 }}>
//                     {batch.batchName}
//                   </h4>

//                   {/* With-record students */}
//                   {batch.withRecordStudents?.length > 0 && (
//                     <>
//                       <div className="meta" style={{ marginBottom: 6 }}>
//                         Students with previous record (
//                         {batch.withRecordStudents.length})
//                       </div>
//                       <div className="table-scroll" style={{ marginBottom: 12 }}>
//                         <table>
//                           <thead>
//                             <tr>
//                               <th>Reg. No</th>
//                               <th>Name</th>
//                               <th>Current Sem</th>
//                               <th>Target Sem</th>
//                               <th>Section</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {batch.withRecordStudents.map((s: any) => (
//                               <tr key={s.studentId}>
//                                 <td className="subj-title">{s.regNumber}</td>
//                                 <td>{s.fullName}</td>
//                                 <td>{s.currentSemester ?? '—'}</td>
//                                 <td>{s.targetSemester}</td>
//                                 <td className="subj-sub">
//                                   {s.sectionName ?? '—'}
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </>
//                   )}

//                   {/* Without-record students */}
//                   {batch.withoutRecordStudents?.length > 0 && (
//                     <>
//                       <div className="meta" style={{ marginBottom: 6 }}>
//                         New students ({batch.withoutRecordStudents.length})
//                       </div>
//                       <div className="table-scroll">
//                         <table>
//                           <thead>
//                             <tr>
//                               <th>Reg. No</th>
//                               <th>Name</th>
//                               <th>Target Sem</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {batch.withoutRecordStudents.map((s: any) => (
//                               <tr key={s.studentId}>
//                                 <td className="subj-title">{s.regNumber}</td>
//                                 <td>{s.fullName}</td>
//                                 <td>{s.targetSemester}</td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               ))}

//               <button
//                 type="button"
//                 className="btn"
//                 style={{ marginTop: 8 }}
//                 disabled={lockMutation.isPending}
//                 onClick={() => {
//                   if (
//                     window.confirm(
//                       'Lock progression? This will create permanent student academic records.',
//                     )
//                   ) {
//                     lockMutation.mutate()
//                   }
//                 }}
//               >
//                 {lockMutation.isPending ? 'Locking…' : 'Lock Progression'}
//               </button>
//             </>
//           )}
//         </>
//       )}

//       {/* ── 6. DONE ─────────────────────────────────────── */}
//       {step === 'done' && (
//         <div style={{ textAlign: 'center', padding: '48px 0' }}>
//           <div
//             style={{
//               width: 56,
//               height: 56,
//               borderRadius: '50%',
//               background: '#e8f5e9',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               margin: '0 auto 16px',
//               fontSize: 28,
//             }}
//           >
//             ✓
//           </div>
//           <h3 style={{ color: '#2e7d32', margin: '0 0 8px' }}>
//             Progression Locked Successfully
//           </h3>
//           <p style={{ color: 'var(--ink-faint)', margin: 0 }}>
//             Student academic records have been created for this session.
//           </p>
//         </div>
//       )}
//     </div>
//   )
// }