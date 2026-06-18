import { formatString } from '@/lib/text/format-string'
import fs from 'fs'
import path from 'path'

const DIR = 'src/components/pages/apps'

function walk(dir: string, apps: any[]) {
  const dirs: string[] = []
  const files: string[] = []

  fs.readdirSync(dir).forEach(f => {
    f = path.join(dir, f)

    const isDir = fs.lstatSync(f).isDirectory()

    if (isDir) {
      dirs.push(f)
    } else {
      files.push(f)
    }
  })

  dirs.map(d => walk(d, apps))

  //let collection = dir.replace(/^.+module\//, '')
  //collection = collection.charAt(0).toUpperCase() + collection.slice(1)

  //const ms = { collection, modules: [] }

  for (const f of files.filter(f => f.includes('manifest.json'))) {
    const module = JSON.parse(fs.readFileSync(f) as any)

    module.copyright = formatString(module.copyright)

    apps.push(module)
  }
}

console.log(`--------------------`)
console.log(`Discovering apps`)
console.log(`--------------------`)
console.log(`dir: ${DIR}`)

let modules: any[] = []

walk(DIR, modules)

modules.sort((a, b) => a.name.localeCompare(b.name))

fs.writeFileSync('public/apps.json', JSON.stringify(modules, null, 2))

console.log(`Finished.`)
