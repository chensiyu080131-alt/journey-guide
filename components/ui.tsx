'use client'

import { cn } from '@/lib/utils'

// ===== Button =====
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-xuncheng-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-xuncheng-500 text-white hover:bg-xuncheng-600 active:bg-xuncheng-700 shadow-sm':
            variant === 'primary',
          'bg-xuncheng-100 text-xuncheng-700 hover:bg-xuncheng-200':
            variant === 'secondary',
          'bg-transparent hover:bg-ink-50 text-ink-600':
            variant === 'ghost',
          'border-2 border-ink-200 bg-white text-ink-700 hover:bg-ink-50':
            variant === 'outline',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-5 py-2.5 text-base': size === 'md',
          'px-7 py-3.5 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// ===== Input =====
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = ({ label, className, ...props }: InputProps) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-ink-600 mb-1.5">
        {label}
      </label>
    )}
    <input
      className={cn(
        'w-full px-4 py-3 rounded-xl border border-ink-200 bg-white text-ink-900 placeholder:text-ink-300',
        'focus:outline-none focus:ring-2 focus:ring-xuncheng-400 focus:border-transparent',
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  </div>
)

// ===== Badge/Tag =====
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | '文化' | '美食' | '自然' | '体验' | '景点' | 'active'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
        {
          'bg-ink-100 text-ink-600': variant === 'default',
          'bg-indigo/10 text-indigo': variant === '文化',
          'bg-vermilion/10 text-vermilion': variant === '美食',
          'bg-jade/10 text-jade': variant === '自然',
          'bg-xuncheng-100 text-xuncheng-700': variant === '体验',
          'bg-indigo/10 text-indigo': variant === '景点',
          'bg-xuncheng-500 text-white': variant === 'active',
        },
        className
      )}
    >
      {children}
    </span>
  )
}

// ===== Card =====
interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-ink-100 shadow-sm',
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-4 pt-4 pb-2', className)}>{children}</div>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-4 pb-4', className)}>{children}</div>
}
