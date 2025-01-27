import cx from 'clsx'
import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef } from 'react'

interface ButtonProps
  extends Omit<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'ref'> {
  active?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, active = false, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cx(
        'text-lg p-2 rounded focus:outline-none transition-colors',
        active
          ? 'bg-primary-400 hover:bg-primary-500 focus:bg-primary-600'
          : 'bg-background hover:bg-background-lighter focus:bg-background-lighter',
        className,
      )}
      {...props}
    />
  )
})

Button.displayName = 'Button'

export default Button
