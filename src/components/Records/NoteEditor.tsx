import { useId, useState } from 'react'
import { RecordFilters, RecordGroup } from './Records'
import styles from './NoteEditor.module.css'

const tags = [
  { id: 'action', label: 'اقدام' },
  { id: 'learning', label: 'یادگیری' },
  { id: 'feedback', label: 'بازخورد' },
] as const
type Tag = (typeof tags)[number]['id']
export type NoteContent = {
  title: string
  description: string
  tag?: Tag
  sessionId?: string
}
const limit = 500

export function NoteEditor({
  initial,
  sessions,
  onSave,
  formId,
}: {
  initial: NoteContent
  sessions: readonly { id: string; label: string }[]
  onSave: (note: NoteContent) => void
  formId: string
}) {
  const id = useId()
  const [note, setNote] = useState(initial)

  return (
    <form
      id={formId}
      className={styles.editor}
      onSubmit={(event) => {
        event.preventDefault()
        const title = note.title.trim()
        const description = note.description.trim()
        if (title && description) onSave({ ...note, title, description })
      }}
    >
      <RecordGroup title="عنوان یادداشت">
        <input
          aria-label="عنوان یادداشت"
          required
          value={note.title}
          maxLength={120}
          pattern=".*\S.*"
          onChange={(event) =>
            setNote({ ...note, title: event.currentTarget.value })
          }
        />
      </RecordGroup>
      <RecordGroup title="متن یادداشت">
        <textarea
          aria-label="متن یادداشت"
          aria-describedby={id}
          required
          rows={4}
          maxLength={limit}
          value={note.description}
          onChange={(event) => {
            event.currentTarget.setCustomValidity(
              event.currentTarget.value && !event.currentTarget.value.trim()
                ? 'متن یادداشت را وارد کنید.'
                : '',
            )
            setNote({ ...note, description: event.currentTarget.value })
          }}
        />
        <small id={id}>
          {note.description.length.toLocaleString('fa-IR')} از{' '}
          {limit.toLocaleString('fa-IR')}
        </small>
      </RecordGroup>
      <RecordGroup title="برچسب اختیاری">
        <RecordFilters<Tag | ''>
          options={tags}
          showSelection
          selected={note.tag ?? ''}
          label="برچسب یادداشت"
          onSelect={(tag) =>
            setNote({ ...note, tag: tag && tag !== note.tag ? tag : undefined })
          }
        />
      </RecordGroup>
      <RecordGroup title="ارتباط با جلسه">
        <select
          aria-label="جلسهٔ مرتبط"
          value={note.sessionId ?? ''}
          onChange={(event) =>
            setNote({
              ...note,
              sessionId: event.currentTarget.value || undefined,
            })
          }
        >
          <option value="">بدون ارتباط با جلسه</option>
          {sessions.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </RecordGroup>
    </form>
  )
}
