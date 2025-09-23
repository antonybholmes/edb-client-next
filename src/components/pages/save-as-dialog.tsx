import { TEXT_CANCEL, TEXT_NAME, TEXT_SAVE_AS } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@dialog/ok-cancel-dialog'

import { useState } from 'react'
import { Input } from '../shadcn/ui/themed/input'
import { LabelContainer } from '../shadcn/ui/themed/label'

export interface ISaveAsFormat {
  name: string
  ext: string
}

export interface ISaveAsDialogProps extends IModalProps {
  name?: string
  formats?: ISaveAsFormat[]
}

export function SaveAsDialog({
  open = true,
  title = TEXT_SAVE_AS,
  name = 'file',
  formats = [],
  onResponse = () => {},
}: ISaveAsDialogProps) {
  const [text, setText] = useState(name)

  return (
    <OKCancelDialog
      open={open}
      title={title}
      //buttons={[...formats.map(format => format.ext), TEXT_CANCEL]}
      buttons={formats.map((format) => format.ext.toUpperCase())}
      onResponse={(response) => {
        if (response !== TEXT_CANCEL) {
          const format = formats.filter(
            (f) => f.ext.toUpperCase() === response
          )[0]!
          onResponse?.(response, {
            name: `${text.split('.')[0]}.${response.toLowerCase()}`,
            format,
          })
        } else {
          onResponse?.(response)
        }
      }}
      //contentVariant="glass"
      //bodyVariant="card"
      //bodyCls="gap-y-2"
    >
      {/* {formats.map((format, fi) => (
        <Button
          key={fi}
          variant={fi === 0 ? 'theme' : 'secondary'}
          size="lg"
          onClick={() => onSave?.(format)}
          aria-label="Open groups"
        >
          {format.name} (.{format.ext})
        </Button>
      ))} */}

      <LabelContainer label={TEXT_NAME} id="save-as">
        <Input
          value={text}
          id="save-as"
          placeholder="Save as..."
          onChange={(e) => setText(e.target.value)}
          className="rounded-theme grow"
        />
      </LabelContainer>

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
