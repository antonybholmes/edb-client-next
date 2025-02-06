import fs from "fs"
import path from "path"

function walk(dir, pathways) {
  const dirs = []
  const files = []

  fs.readdirSync(dir).forEach(f => {
    f = path.join(dir, f)

    const isDir = fs.lstatSync(f).isDirectory()

    if (isDir) {
      dirs.push(f)
    } else {
      files.push(f)
    }
  })

  dirs.map(d => walk(d, pathways))

  const database = dir.replace(/^.+pathways\//, "")

  const ds = { database, genesets: [] }

  files
    .filter(f => f.endsWith("gmt"))
    .forEach(f => {
      const name = f.replace(/^.+\//, "").replace(".gmt", "")
 
      ds.genesets.push({ name, url: `/${f.replace("public/", "")}` })
    })

  if (ds.genesets.length > 0) {
    pathways.push(ds)
  }
}

const DIR = "public/data/modules/pathways"

console.log(`--------------------`)
console.log(`Discovering genesets`)
console.log(`--------------------`)
console.log(`dir: ${DIR}`)

const pathways = []

walk(DIR, pathways)

fs.writeFileSync(
  "public/data/modules/pathways/genesets.json",
  JSON.stringify(pathways, null, 2)
)

console.log(`Finished.`)
