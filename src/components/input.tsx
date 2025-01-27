import cx from 'clsx'
import { DetailedHTMLProps, forwardRef, InputHTMLAttributes } from 'react'

type InputProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'ref'>

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cx(
        'bg-background border-2 border-primary-400 rounded text-text px-2 focus:outline-none focus:border-primary-700 transition-colors',
        className,
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export default Input
