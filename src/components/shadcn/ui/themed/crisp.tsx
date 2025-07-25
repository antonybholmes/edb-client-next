import { CloseIcon } from '@icons/close-icon'
import { ErrorIcon } from '@icons/error-icon'
import { WarningIcon } from '@icons/warning-icon'
import { VCenterCol } from '@layout/v-center-col'
import { VCenterRow } from '@layout/v-center-row'
import { toast as sonnerToast } from 'sonner'
import { Button } from './button'
import { toastVariants, type IToast } from './toast'

/** I recommend abstracting the toast function
 *  so that you can call it without having to use toast.custom everytime. */
export function toast({
  variant,
  title,
  description,
  button,
  durationMs = 30000,
}: Omit<IToast, 'id'>) {
  return sonnerToast.custom(
    id => (
      <Toast
        variant={variant}
        id={id}
        title={title}
        description={description}
        button={{
          label: button?.label,
          onClick: () => button?.onClick(),
        }}
      />
    ),
    { duration: durationMs }
  )
}

/** A fully custom toast that still maintains the animations and interactions. */
function Toast({ id, variant, title, description, button }: IToast) {
  return (
    <div className={toastVariants({ variant })}>
      <VCenterRow className="gap-x-4">
        <WarningIcon w="w-8 h-8" className="hidden group-[.warning]:block" />
        <ErrorIcon w="w-8 h-8" className="hidden group-[.destructive]:block" />
        <VCenterCol className="gap-y-1">
          <h1 className="text-sm font-bold">{title}</h1>
          {typeof description === 'string' ? (
            <p className="text-sm ">{description}</p>
          ) : (
            description
          )}
        </VCenterCol>
      </VCenterRow>

      {button?.label ? (
        <Button
          variant="theme"
          className="cursor-pointer"
          onClick={() => {
            button?.onClick()
            sonnerToast.dismiss(id)
          }}
        >
          {button.label}
        </Button>
      ) : (
        <button
          onClick={() => {
            sonnerToast.dismiss(id)
          }}
          className="cursor-pointer"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  )
}

// export   function Headless() {
//   return (
//     <button
//       className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white"
//       onClick={() => {
//         toast({
//           title: 'This is a headless toast',
//           description: 'You have full control of styles and jsx, while still having the animations.',
//           button: {
//             label: 'Reply',
//             onClick: () => sonnerToast.dismiss(),
//           },
//         });
//       }}
//     >
//       Render toast
//     </button>
//   );
// }
