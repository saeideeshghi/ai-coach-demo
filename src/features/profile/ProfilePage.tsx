import { Fragment, useEffect, useId, useRef, useState } from 'react'
import back from '../../assets/account/back.svg'
import icons from '../../assets/profile/options.svg?no-inline'
import searchIcon from '../../assets/profile/search.svg'
import { featured, goalLimit, hasAnswer, industryCatalogue, loadDraft, questions, reasons, searchIndustries, storeDraft } from './profileDraft'
import type { Option } from './profileDraft'
import { ProgramChevron } from '../../components/ProgramChevron'
import { useSheetMotion } from '../../components/ProgramSheet/useSheetMotion'
import motion from '../../components/ProgramSheet/sheetMotion.module.css'
import styles from './ProfilePage.module.css'

const digits = new Intl.NumberFormat('fa-IR')

function CopyLines({ lines }: { lines: readonly string[] }) {
  return lines.map((line, index) => (
    <Fragment key={line}>
      {index > 0 && <> <br className={styles.referenceBreak} /></>}
      {line}
    </Fragment>
  ))
}

function Options({ label, items, selected, multiple = false, onChange }: {
  label: string
  items: readonly Option[]
  selected: readonly string[]
  multiple?: boolean
  onChange: (id: string) => void
}) {
  const group = useId()

  return (
    <fieldset className={styles.options} data-multiple={multiple}>
      <legend className={styles.hidden}>{label}</legend>
      {items.map(({ id, label: item, icon, description }) => {
        const checked = selected.includes(id)
        return (
          <label className={styles.option} data-described={Boolean(description)} key={id}>
            {icon && <svg aria-hidden="true" width="24" height="24"><use href={icons + '#' + icon} width="24" height="24" /></svg>}
            <span>{item}{description && <small id={group + id}>{description}</small>}</span>
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={multiple ? undefined : group}
              aria-label={item}
              aria-describedby={description ? group + id : undefined}
              checked={checked}
              disabled={multiple && !checked && selected.length >= 2}
              onChange={() => onChange(id)}
            />
          </label>
        )
      })}
    </fieldset>
  )
}

function IndustryPicker({ query, selection, onQuery, onConfirm, onClose }: {
  query: string
  selection?: string
  onQuery: (query: string) => void
  onConfirm: (selection: string) => void
  onClose: () => void
}) {
  const search = useRef<HTMLInputElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const [picked, setPicked] = useState(selection)
  const options = searchIndustries(query)
  const { backdrop, panel, closing, exit } = useSheetMotion()

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className={styles.pickerOverlay + ' ' + motion.overlay} data-motion={closing ? 'closing' : undefined}>
      <div className={motion.backdrop} ref={backdrop} aria-hidden="true" />
      <section ref={panel} className={styles.picker + ' ' + motion.panel} inert={closing}
        role="dialog" aria-modal="true" aria-labelledby="industry-title" onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            exit(onClose)
          }
        }}>
        <button type="button" className={styles.close} aria-label="بستن انتخابگر صنعت" onClick={() => exit(onClose)}>×</button>
        <header>
          <h2 id="industry-title" ref={heading} tabIndex={-1}>انتخاب نوع کسب‌وکار</h2>
          <p>حوزهٔ فعالیت کسب‌وکار خود را انتخاب کنید.</p>
        </header>
        <div className={styles.search} data-query={Boolean(query) || undefined}>
          <img src={searchIcon} width="18" height="18" alt="" />
          <input ref={search} type="search" aria-label="جستجو در حوزه‌های کسب‌وکار"
            placeholder="جستجو در حوزه‌های کسب‌وکار..." value={query} onChange={(event) => onQuery(event.target.value)} />
          {query && <button type="button" aria-label="پاک کردن جستجو" onClick={() => {
            onQuery('')
            search.current?.focus()
          }}>×</button>}
        </div>
        <div className={styles.results}>
          {options.length ? <Options label="حوزه‌های فعالیت" items={options} selected={picked ? [picked] : []} onChange={setPicked} />
            : <p role="status">حوزه‌ای پیدا نشد.</p>}
        </div>
        <button type="button" className={styles.primary} onClick={() => picked && exit(() => onConfirm(picked))}
          disabled={!options.some(({ id }) => id === picked)}>تأیید انتخاب</button>
      </section>
    </div>
  )
}

export function ProfilePage({ step, picker, query, onStep, onFinish, onBack, onOpenPicker, onClosePicker, onQuery }: {
  step: number
  picker: boolean
  query: string
  onStep: (step: number) => void
  onFinish: () => void
  onBack: () => void
  onOpenPicker: () => void
  onClosePicker: () => void
  onQuery: (query: string) => void
}) {
  const [draft, setDraft] = useState(loadDraft)
  const heading = useRef<HTMLHeadingElement>(null)
  const more = useRef<HTMLButtonElement>(null)
  const restoreMore = useRef(false)
  const current = questions[step - 1]
  const selected = draft.answers[step]
  const industry = industryCatalogue.find(({ id }) => id === selected)
  const featuredOptions = industry && !featured.some(({ id }) => id === industry.id)
    ? [...featured.slice(0, -1), industry] : featured

  useEffect(() => storeDraft(draft), [draft])
  useEffect(() => {
    if (picker) return
    if (restoreMore.current && more.current) {
      restoreMore.current = false
      more.current.focus({ preventScroll: true })
    } else {
      heading.current?.focus({ preventScroll: true })
      window.scrollTo(0, 0)
    }
  }, [step, picker])

  function choose(id: string) {
    setDraft(previous => ({ ...previous, answers: { ...previous.answers, [step]: id } }))
  }

  function advance() {
    if (step < questions.length) {
      onStep(step + 1)
      return
    }
    const incomplete = questions.findIndex((_, index) => !hasAnswer(draft, index + 1))
    if (incomplete >= 0) onStep(incomplete + 1)
    else onFinish()
  }

  return (
    <section className={styles.screen} data-picker={picker} data-step={step}>
      <div className={styles.top} inert={picker}>
        <button type="button" className={styles.back} onClick={picker ? onClosePicker : onBack} aria-label="بازگشت">
          <img src={back} alt="" width="10" height="16" />
        </button>
        <div className={styles.progress} role="progressbar" aria-label="پیشرفت شناخت کسب‌وکار"
          aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={step}>
          {questions.map(({ lines }, index) => <span key={lines[0]} data-filled={index < step} />)}
        </div>
        <span className={styles.count}>سؤال {digits.format(step)} از {digits.format(questions.length)}</span>
      </div>
      <div className={styles.form} inert={picker}>
        <header className={styles.question}>
          <small>{current.group}</small>
          <h1 ref={heading} tabIndex={-1}><CopyLines lines={current.lines} /></h1>
          {current.hint && <p><CopyLines lines={current.hint} /></p>}
        </header>
        {step === 1 && (
          <>
            <Options label={current.lines.join(' ')} items={featuredOptions} selected={selected ? [selected] : []} onChange={choose} />
            <button type="button" ref={more} className={styles.more} onClick={() => {
              restoreMore.current = true
              onOpenPicker()
            }}>
              <svg className={styles.moreMark} aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5h.01M15 5h.01M5 15h.01M15 15h.01" stroke="currentColor"
                  strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span>مشاهده همه حوزه‌ها</span>
              <ProgramChevron />
            </button>
          </>
        )}
        {current.options && <Options label={current.lines.join(' ')} items={current.options} selected={selected ? [selected] : []} onChange={choose} />}
        {step === 5 && <Options label={current.lines.join(' ')} items={reasons} selected={draft.reasons} multiple onChange={(id) => {
          setDraft(previous => ({
            ...previous,
            reasons: previous.reasons.includes(id) ? previous.reasons.filter(value => value !== id) : [...previous.reasons, id],
          }))
        }} />}
        {step === 6 && (
          <div className={styles.goal}>
            <textarea aria-label="هدف کسب‌وکار" aria-describedby="goal-count" maxLength={goalLimit}
              value={draft.goal} placeholder="مثلاً فروش ماهانه را ۷۰٪ افزایش دهم، یا وابستگی کسب‌وکار به خودم را کمتر کنم."
              onChange={event => {
                const value = event.target.value
                setDraft(previous => ({ ...previous, goal: value }))
              }} />
            <small id="goal-count">{digits.format(draft.goal.length)} / {digits.format(goalLimit)}</small>
          </div>
        )}
        <div className={styles.actions}>
          <button type="button" className={styles.primary} disabled={!hasAnswer(draft, step)} onClick={advance}>
            {step === questions.length ? 'شروع گفتگو' : 'ادامه'}
          </button>
        </div>
      </div>
      {picker && <IndustryPicker query={query} selection={selected} onQuery={onQuery} onClose={onClosePicker}
        onConfirm={(value) => { choose(value); onClosePicker() }} />}
    </section>
  )
}
