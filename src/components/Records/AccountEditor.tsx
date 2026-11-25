import { ProfileField } from './ProfileField'
import { useId } from 'react'
import { RecordGroup } from './Records'
import styles from './AccountEditor.module.css'

export type AccountProfile = {
  name: string
  job: string
  email: string
  phone: string
}
const fields = [
  {
    name: 'name',
    label: 'نام و نام خانوادگی',
    type: 'text',
    autoComplete: 'name',
  },
  {
    name: 'job',
    label: 'عنوان شغلی',
    type: 'text',
    autoComplete: 'organization-title',
  },
  { name: 'email', label: 'آدرس ایمیل', type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'شماره همراه', type: 'tel', autoComplete: 'tel' },
] as const

export function AccountEditor({
  initialProfile,
  onSave,
  formId,
}: {
  initialProfile: AccountProfile
  onSave: (profile: AccountProfile) => void
  formId: string
}) {
  const hint = useId()
  return (
    <form
      id={formId}
      className={styles.form}
      aria-describedby={hint}
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const value = (name: keyof AccountProfile) =>
          String(data.get(name) ?? '').trim()
        onSave({
          name: value('name'),
          job: value('job'),
          email: value('email'),
          phone: value('phone'),
        })
      }}
    >
      <RecordGroup title="اطلاعات شخصی">
        {fields.map(({ name, label, type, autoComplete }) => (
          <ProfileField
            key={name}
            name={name}
            label={label}
            type={type}
            autoComplete={autoComplete}
            defaultValue={initialProfile[name]}
            required={name === 'name' || name === 'email'}
            pattern={name === 'name' ? '.*\\S.*' : undefined}
          />
        ))}
      </RecordGroup>
      <p id={hint}>
        تغییر ایمیل یا شماره همراه ممکن است نیازمند تأیید مجدد باشد.
      </p>
    </form>
  )
}
