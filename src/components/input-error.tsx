import type { IDivProps } from '@interfaces/div-props'
import { forwardRef, type ForwardedRef } from 'react'
import type { FieldError } from 'react-hook-form'
import { WarningIcon } from './icons/warning-icon'
import { VCenterRow } from './layout/v-center-row'

export const InputError = forwardRef(function InputError(
  { children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <VCenterRow ref={ref} className="gap-x-1 text-xs text-red-500" {...props}>
      {children}
    </VCenterRow>
  )
})

export const InputErrorWithIcon = forwardRef(function InputErrorWithIcon(
  { children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <InputError ref={ref} className="py-1" {...props}>
      <WarningIcon w="w-4" />
      {children}
    </InputError>
  )
})

interface IFormInputErrorProps {
  error: FieldError | undefined | null
}
export function FormInputError({ error }: IFormInputErrorProps) {
  if (!error) {
    return null
  }

  return <InputError>{error!.message as string}</InputError>
}
