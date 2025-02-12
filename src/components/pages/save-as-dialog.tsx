import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'

import { Button } from '@components/shadcn/ui/themed/button'
import type { IElementProps } from '@interfaces/element-props'

export interface ISaveAsFormat {
  name: string
  ext: string
}

export interface IProps extends IElementProps {
  open: string
  formats: ISaveAsFormat[]
  onSave: (format: ISaveAsFormat) => void
  onCancel: () => void
}

export function SaveAsDialog({
  open = '',
  title = '',
  formats: types,
  onSave = () => {},
  onCancel = () => {},
}: IProps) {
  return (
    <OKCancelDialog
      open={open !== ''}
      title={title}
      buttons={[]}
      onReponse={r => {
        if (r !== TEXT_OK) {
          onCancel()
        }
      }}
      bodyCls="gap-y-2"
    >
      {types.map((type, ti) => (
        <Button
          key={ti}
          variant={ti === 0 ? 'theme' : 'secondary'}
          size="lg"
          onClick={() => onSave?.(type)}
          aria-label="Open groups"
        >
          {type.name} (.{type.ext})
        </Button>
      ))}

      {/* <Form {...form}>
        <form
          className="flex flex-col text-sm"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="format"
            render={({ field }) => (
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center gap-x-2">
                    <FormControl>
                      <RadioGroupItem value="txt" />
                    </FormControl>
                    <FormLabel>TXT</FormLabel>
                  </FormItem>
 
                  <FormItem className="flex items-center gap-x-2">
                    <FormControl>
                      <RadioGroupItem value="csv" />
                    </FormControl>
                    <FormLabel>CSV</FormLabel>
                  </FormItem>
        
                </RadioGroup>
              </FormControl>
            )}
          />

          <button ref={btnRef} type="submit" className="hidden" />
        </form>
      </Form> */}
    </OKCancelDialog>
  )
}
