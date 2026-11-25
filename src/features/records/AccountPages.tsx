import { useId, useState } from 'react'
import { RecordFilters, RecordGroup, NotificationCard } from '../../components/Records/Records'
import { AccountEditor } from '../../components/Records/AccountEditor'
import { SettingsSwitch } from '../../components/SettingsSwitch/SettingsSwitch'
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton'
import { SecondaryButton } from '../../components/SecondaryButton/SecondaryButton'
import { ProgramChevron } from '../../components/ProgramChevron'
import { alerts, preferences, records } from '../../fixtures/records'
import avatar from '../../assets/coach/summary-profile.png'
import { RecordPage } from './RecordPage'
import styles from './RecordPages.module.css'

export type NotificationId = (typeof alerts)[number]['id']
const filters = [
  { id: 'all', label: 'همه' },
  { id: 'unread', label: 'خوانده‌نشده' },
  { id: 'read', label: 'خوانده‌شده' },
] as const

export function NotificationsPage({ onBack, onSettings, onOpen }: { onBack: () => void; onSettings: () => void; onOpen: (id: NotificationId) => void }) {
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all')
  const seen = records.readAlerts()
  const items = alerts.filter(({ id }) => filter === 'all' || seen.includes(id) === (filter === 'read'))
  return <RecordPage view="notifications" title="مرکز اعلان‌ها" subtitle="اطلاع‌رسانی‌های مهم، رویدادها و به‌روزرسانی‌ها" onBack={onBack}
    footer={<SecondaryButton onClick={onSettings}>تنظیمات اعلان‌ها<ProgramChevron /></SecondaryButton>}>
    <RecordFilters options={filters} selected={filter} onSelect={setFilter} label="وضعیت خواندن" appearance="notification" />
    {items.map(item => <NotificationCard key={item.id} {...item} unread={!seen.includes(item.id)} onOpen={() => {
      records.markRead(item.id)
      onOpen(item.id)
    }} />)}
    {!items.length && <p role="status">اعلانی در این بخش وجود ندارد.</p>}
  </RecordPage>
}

export function AccountPage({ onBack, onEdit, onPassword, onLogout }: {
  onBack: () => void
  onEdit: () => void
  onPassword: () => void
  onLogout: () => void
}) {
  const profile = records.profile()
  const [settings, setSettings] = useState(records.preferences)
  const [confirm, setConfirm] = useState(false)
  return <RecordPage view="account" title="حساب کاربری" subtitle="مدیریت اطلاعات، تنظیمات و امنیت حساب" onBack={onBack}
    footer={confirm ? <div className={styles.signOut}>
      <p>از حساب آزمایشی خارج می‌شوید؟</p>
      <SecondaryButton appearance="destructive" onClick={onLogout}>تأیید خروج</SecondaryButton>
      <SecondaryButton onClick={() => setConfirm(false)}>انصراف</SecondaryButton>
    </div> : <SecondaryButton appearance="destructive" onClick={() => setConfirm(true)}>خروج از حساب</SecondaryButton>}>
    <section className={styles.accountIdentity}>
      <button type="button" aria-label="ویرایش اطلاعات حساب" onClick={onEdit}>ویرایش</button>
      <span><strong>{profile.name}</strong><small>{profile.job}</small></span><img src={avatar} alt="" width="50" height="50" />
    </section>
    <RecordGroup title="اطلاعات حساب">
      <dl className={styles.accountRows}>
        {([[ 'نام و نام خانوادگی', profile.name], ['ایمیل', profile.email], ['شماره همراه', profile.phone]] as const).map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd dir="auto">{value || '—'}</dd></div>
        ))}
      </dl>
    </RecordGroup>
    <RecordGroup title="تنظیمات برنامه">
      {preferences.map(({ key, label }) => <SettingsSwitch compact key={key} label={label} checked={settings[key]}
        onChange={checked => setSettings(records.savePreferences({ ...settings, [key]: checked }))} />)}
    </RecordGroup>
    <RecordGroup title="امنیت حساب">
      <button className={styles.accountRowButton} type="button" onClick={onPassword}>تغییر رمز عبور<ProgramChevron /></button>
      <SettingsSwitch compact label="ورود دومرحله‌ای" checked={false} disabled onChange={() => {}} />
    </RecordGroup>
    <RecordGroup title="دربارهٔ برنامه">
      <dl className={styles.accountRows}><div><dt>نسخهٔ برنامه</dt><dd>۱٫۰٫۰</dd></div></dl>
      <details className={styles.about}><summary>قوانین و حریم خصوصی</summary><p>داده‌های این نسخهٔ آزمایشی در همان زبانهٔ مرورگر ذخیره می‌شوند.</p></details>
      <details className={styles.about}><summary>راهنمای استفاده</summary><p>از نوار اصلی می‌توانید به خانه، کوچینگ، آموزش، پیگیری و سوابق بروید.</p></details>
    </RecordGroup>
  </RecordPage>
}

export function AccountEditPage({ onBack }: { onBack: () => void }) {
  const formId = useId()
  return <RecordPage view="account-edit" title="ویرایش اطلاعات حساب" subtitle="اطلاعات حساب خود را بررسی و ویرایش کنید." onBack={onBack}
    footer={<><PrimaryButton appearance="program" type="submit" form={formId}>ذخیره تغییرات</PrimaryButton>
      <SecondaryButton onClick={onBack}>انصراف</SecondaryButton></>}>
    <AccountEditor initialProfile={records.profile()} formId={formId} onSave={profile => {
      records.saveProfile(profile)
      onBack()
    }} />
  </RecordPage>
}
