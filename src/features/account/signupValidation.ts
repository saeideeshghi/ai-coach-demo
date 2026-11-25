type Field = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmation' | 'terms'
export type SignupErrors = Partial<Record<Field, string>>

export function checkSignup(form: HTMLFormElement): SignupErrors {
  const data = new FormData(form)
  const password = String(data.get('password') ?? '')
  const email = form.elements.namedItem('email')
  const errors: SignupErrors = {}

  if (!String(data.get('firstName') ?? '').trim()) errors.firstName = 'نام را وارد کنید.'
  if (!String(data.get('lastName') ?? '').trim()) errors.lastName = 'نام خانوادگی را وارد کنید.'
  if (!(email instanceof HTMLInputElement) || !email.validity.valid) {
    errors.email = 'ایمیل معتبر وارد کنید.'
  }
  if (Array.from(password).length < 8 || !/\p{L}/u.test(password) || !/\p{Nd}/u.test(password)) {
    errors.password = 'رمز عبور باید حداقل ۸ کاراکتر و ترکیبی از حروف و عدد باشد.'
  }
  if (!data.get('confirmation') || data.get('confirmation') !== password) {
    errors.confirmation = 'تکرار رمز عبور باید با رمز عبور یکسان باشد.'
  }
  if (!data.has('terms')) errors.terms = 'پذیرش شرایط استفاده لازم است.'
  return errors
}
