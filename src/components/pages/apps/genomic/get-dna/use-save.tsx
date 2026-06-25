import { download } from '@/lib/download-utils'
import { dnaToJson } from '@/lib/genomic/dna'
import { useDNA } from './dna-store'

export function useSave() {
  const { settings } = useDNA()

  function save(format = 'fasta') {
    if (settings.outputSeqs.length === 0) {
      return
    }

    switch (format) {
      case 'json':
        download(dnaToJson(settings.outputSeqs), 'dna.json')
        break
      default:
        download(
          settings.outputSeqs
            .map((seq) => `>${seq.location.toString()}\n${seq.seq}`)
            .join('\n'),
          'dna.fasta'
        )
        break
    }

    //setShowFileMenu(false)
  }

  return {
    save,
  }
}
