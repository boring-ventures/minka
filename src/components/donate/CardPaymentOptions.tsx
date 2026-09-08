'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  currency: 'USD' | 'BOB'
  onCurrencyChange: (currency: 'USD' | 'BOB') => void
  email: string
  onEmailChange: (email: string) => void
  onRefreshSession: () => Promise<void>
  authenticated: boolean
  disabled?: boolean
}

export function CardPaymentOptions({
  currency,
  onCurrencyChange,
  email,
  onEmailChange,
  onRefreshSession,
  authenticated,
  disabled,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [accountTabOpened, setAccountTabOpened] =
    useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const showInput = !authenticated || editing || !email
  return (
    <div className='mt-6 space-y-5 rounded-lg border border-gray-200 p-5'>
      <fieldset disabled={disabled}>
        <legend className='mb-2 text-sm font-medium text-gray-900'>
          Moneda del pago
        </legend>
        <div className='inline-flex gap-1 rounded-full border border-gray-300 bg-white p-1'>
          {(['USD', 'BOB'] as const).map((option) => (
            <label
              key={option}
              className={`relative cursor-pointer rounded-full px-5 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-[#2c6e49] focus-within:ring-offset-2 ${currency === option ? 'bg-[#2c6e49] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <input
                type='radio'
                name='card-currency'
                value={option}
                checked={currency === option}
                onChange={() => onCurrencyChange(option)}
                className='sr-only'
              />
              {option === 'USD' ? '$ / USD' : 'Bs. / BOB'}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        {authenticated && !showInput ? (
          <div className='flex flex-wrap items-center gap-x-3 gap-y-2 text-sm'>
            <span className='text-gray-700'>
              Se notificará el pago a:
            </span>
            <span className='break-all text-gray-500'>
              {email}
            </span>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={disabled}
              className='h-7 rounded-full px-3 text-xs'
              onClick={() => setEditing(true)}
            >
              Cambiar
            </Button>
          </div>
        ) : (
          <>
            <label
              htmlFor='payment-email'
              className='mb-2 block text-sm font-medium text-gray-900'
            >
              Correo para notificarte del pago online
            </label>
            <div className='flex items-start gap-2'>
              <Input
                ref={inputRef}
                id='payment-email'
                type='email'
                autoComplete='email'
                required
                maxLength={254}
                value={email}
                disabled={disabled}
                autoFocus={authenticated && editing}
                onChange={(event) =>
                  onEmailChange(event.target.value)
                }
                placeholder='tu@correo.com'
                aria-describedby={
                  !authenticated
                    ? 'payment-email-note'
                    : undefined
                }
                className='bg-white'
              />
              {authenticated && editing && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={disabled}
                  className='rounded-full'
                  onClick={() => {
                    if (inputRef.current?.reportValidity())
                      setEditing(false)
                  }}
                >
                  Listo
                </Button>
              )}
            </div>
            {!authenticated && (
              <p
                id='payment-email-note'
                className='mt-2 text-sm text-gray-900 font-medium'
              >
                {accountTabOpened ? (
                  <>
                    Cuando termines de crear tu cuenta,
                    vuelve aquí y pulsa{' '}
                    <button
                      type='button'
                      className='inline-flex items-center rounded-full bg-amber-400 px-3 py-1 font-bold text-amber-950 shadow-sm transition-colors hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
                      disabled={disabled || refreshing}
                      onClick={async () => {
                        setRefreshing(true)
                        try {
                          await onRefreshSession()
                        } finally {
                          setRefreshing(false)
                        }
                      }}
                    >
                      {refreshing
                        ? 'Actualizando…'
                        : 'Refrescar.'}
                    </button>
                  </>
                ) : (
                  <>
                    Te recomendamos{' '}
                    <a
                      href='/sign-up?paymentSignup=1'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-black underline underline-offset-2 hover:text-[#2c6e49] focus:outline-none focus:ring-2 focus:ring-[#2c6e49] focus:ring-offset-2'
                      onClick={() =>
                        setAccountTabOpened(true)
                      }
                    >
                      crear una cuenta
                    </a>{' '}
                    para que este dato se complete
                    automáticamente.
                  </>
                )}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
