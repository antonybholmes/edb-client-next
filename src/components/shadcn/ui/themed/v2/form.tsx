import { Field as FieldPrimitive } from '@base-ui/react/field'

import { useStableId } from '@/hooks/stable-id'
import { cn } from '@/lib/shadcn-utils'

import { createContext, useContext, type ComponentProps } from 'react'
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

export const Form = FormProvider

export const Field = FieldPrimitive.Root
export const Label = FieldPrimitive.Label
export const Description = FieldPrimitive.Description

interface IFormFieldContext {
  name: string
}

const FormFieldContext = createContext<IFormFieldContext>({ name: '' })

interface IFormItemContext {
  id: string
}

const FormItemContext = createContext<IFormItemContext>({ id: '' })

// type FormFieldContextValue<
//   TFieldValues extends FieldValues = FieldValues,
//   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
// > = {
//   name: TName
// }

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

export const useFormField = () => {
  const fieldContext = useContext(FormFieldContext)
  const itemContext = useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

export function FormItem({
  className = '',
  ...props
}: ComponentProps<typeof Field>) {
  const id = useStableId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <Field className={className} {...props} />
    </FormItemContext.Provider>
  )
}

export function FormLabel({
  ref,
  className,
  ...props
}: ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

export function FormDescription({
  ref,
  className,
  ...props
}: ComponentProps<typeof Description>) {
  const { formDescriptionId } = useFormField()

  return (
    <Description
      ref={ref}
      id={formDescriptionId}
      className={cn('text-[0.8rem]', className)}
      {...props}
    />
  )
}
export function FormMessage({
  ref,
  className,
  children,
  ...props
}: ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-[0.8rem] font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  )
}
