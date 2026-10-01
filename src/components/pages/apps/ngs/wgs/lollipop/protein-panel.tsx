import { logger } from '@/lib/logger'
import { Textarea } from '@/themed/textarea'
import { produce } from 'immer'
import { useLollipopSettings } from './lollipop-settings-store'
import { checkAA } from './variants'

export function ProteinPanel() {
  //const { searchUniprot } = useProteins()

  const { protein, setProtein } = useLollipopSettings()

  return (
    <>
      <h2 className="font-semibold">Protein Sequence</h2>

      {protein && (
        <span className="text-foreground/50">
          {`${protein.geneSymbol} - ${protein.organism} (${protein.sequence.length} AA)`}
        </span>
      )}
      <Textarea
        id="seq"
        placeholder="Sequence"
        aria-label="Protein sequence"
        value={protein?.sequence ?? ''}
        onLinesChange={v => {
          logger.log('Setting protein sequence:', v)

          if (protein) {
            const p = produce(protein, draft => {
              draft.sequence = checkAA(v[0]!)
            })

            setProtein(p)
          }
          //setContextProtein(p)
        }}
        className="grow"
      />
    </>
  )
}
