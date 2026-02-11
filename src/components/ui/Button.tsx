import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<ButtonVariant, string> = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost: 'btn btn-ghost',
  danger: 'btn btn-danger',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  const variantClass = variants[variant]
  return <button type={type} className={`${variantClass} ${className}`.trim()} {...props} />
}

export default Button
