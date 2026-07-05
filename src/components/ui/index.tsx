import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s/g, '-')

  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <input
        id={inputId}
        className={`rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-500/50 focus:bg-white/6 focus:ring-2 focus:ring-indigo-500/20 ${className}`}
        {...props}
      />
    </label>
  )
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function TextArea({ label, id, className = '', ...props }: TextAreaProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s/g, '-')

  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <textarea
        id={inputId}
        className={`min-h-[88px] resize-y rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-500/50 focus:bg-white/6 focus:ring-2 focus:ring-indigo-500/20 ${className}`}
        {...props}
      />
    </label>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/25',
    secondary:
      'bg-white/6 text-zinc-200 hover:bg-white/10 border border-white/8',
    ghost: 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5',
    danger: 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-all disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({
  children,
  className = '',
  title,
  action,
}: {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
}) {
  return (
    <section
      className={`rounded-2xl border border-white/8 bg-[#16161f]/80 backdrop-blur-xl ${className}`}
    >
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-white/6 px-6 py-4">
          {title && (
            <h2 className="text-sm font-semibold tracking-wide text-zinc-200">
              {title}
            </h2>
          )}
          {action}
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  )
}
