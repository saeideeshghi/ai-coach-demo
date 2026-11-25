import { useId, useState } from 'react'
import { NoteEditor } from '../../components/Records/NoteEditor'
import { RecordCard, RecordFilters } from '../../components/Records/Records'
import { SecondaryButton } from '../../components/SecondaryButton/SecondaryButton'
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton'
import search from '../../assets/profile/search.svg'
import { records, recordSessions } from '../../fixtures/records'
import { RecordPage } from './RecordPage'
import styles from './RecordPages.module.css'

const filters = [
  { id: 'all', label: 'همه' },
  { id: 'session', label: 'جلسات' },
  { id: 'action', label: 'اقدامات' },
  { id: 'course', label: 'دوره‌ها' },
] as const
const categories = { session: 'جلسهٔ کوچ', action: 'اقدام', course: 'دوره' }
const formatter = new Intl.DateTimeFormat('fa-IR', { calendar: 'persian', dateStyle: 'long' })
const normalize = (value: string) => value.replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[\s\u200c]+/g, ' ').trim()

export function NotesPage({ onBack, onOpen, onAdd }: { onBack: () => void; onOpen: (id: string) => void; onAdd: () => void }) {
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all')
  const [query, setQuery] = useState('')
  const notes = records.notes()
  const items = notes.filter(note => (filter === 'all' || note.kind === filter)
    && normalize(note.title + ' ' + note.description).includes(normalize(query)))

  return <RecordPage title="یادداشت‌های من" subtitle="مرور همهٔ یادداشت‌های ثبت‌شده در جلسات و اقدامات" onBack={onBack} endBack
    footer={<PrimaryButton appearance="program" onClick={onAdd}>
      <svg className={styles.noteAddIcon} aria-hidden="true" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 10 7.5-7.5 3 3L6 13l-4 1 1-4Zm6-6 3 3" />
      </svg>افزودن یادداشت
    </PrimaryButton>}>
    <label className={styles.search}>
      <img src={search} alt="" width="17" height="17" />
      <input type="search" aria-label="جست‌وجو در یادداشت‌ها" placeholder="جست‌وجو در یادداشت‌ها" value={query} onChange={event => setQuery(event.currentTarget.value)} />
    </label>
    <RecordFilters options={filters} selected={filter} onSelect={setFilter} label="نوع یادداشت" />
    <p className={styles.meta} aria-live="polite">{items.length.toLocaleString('fa-IR')} یادداشت</p>
    {items.map(note => <RecordCard key={note.id} title={note.title} description={note.description} appearance="note"
      category={categories[note.kind]} meta={note.meta} onOpen={() => onOpen(note.id)} />)}
    {!items.length && <p role="status">یادداشتی پیدا نشد.</p>}
  </RecordPage>
}

export function NoteEditPage({ id, onBack }: { id: string; onBack: () => void }) {
  const formId = useId()
  const note = id === 'new' ? { title: '', description: '' } : records.notes().find(item => item.id === id)
  return <RecordPage view="note-edit" title="ثبت و ویرایش یادداشت" subtitle="ثبت خلاصه جلسات، نکات مهم و اقدامات بعدی" onBack={onBack}
    footer={note && <><PrimaryButton appearance="program" form={formId} type="submit">ذخیرهٔ یادداشت</PrimaryButton>
      <SecondaryButton onClick={onBack}>انصراف</SecondaryButton></>}>
    {note ? <NoteEditor initial={note} sessions={recordSessions.map(session => ({ id: session.id, label: session.title }))}
      formId={formId} onSave={content => {
        records.saveNote({ ...content, id: id === 'new' ? crypto.randomUUID() : id, meta: formatter.format(new Date()),
          kind: content.sessionId ? 'session' : content.tag === 'action' ? 'action' : content.tag === 'learning' ? 'course' : 'session' })
        onBack()
      }} /> : <p role="status">این یادداشت پیدا نشد.</p>}
  </RecordPage>
}
