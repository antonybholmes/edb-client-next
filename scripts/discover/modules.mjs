import * as datefns from "date-fns"
import fs from "fs"
import path from "path"

const config = JSON.parse(fs.readFileSync("./config.json"))

const DIR = "src/pages/module"

function walk(dir, modules) {
  console.log("walk", dir)
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

  dirs.map(d => walk(d, modules))

  let collection = dir.replace(/^.+module\//, "")
  collection = collection.charAt(0).toUpperCase() + collection.slice(1)

  const ms = { collection, modules: [] }

  files
    .filter(f => f.endsWith(".json"))
    .forEach(f => {
      const module = JSON.parse(fs.readFileSync(f))

      const astro = f.replace(".json", ".astro")

      // If the astro file has an updated modified date,
      // bump up the version
      if (fs.existsSync(astro)) {
        console.log(astro)
        const stats = fs.lstatSync(astro)
        const now = Date.parse(stats.mtime)

        const inception = new Date(config.INCEPTION)

        // patch is offset in minutes this week
        const build = datefns.differenceInMinutes(now, inception) + 1 //datefns.format(now, "dd") //datefns.differenceInDays(now, inception)

        //const version = `${major}.${minor}.${build}.${patch}` //datefns.format(Date.now(), 'yyyy.MM.dd.HHmmss')
        const version = `${datefns.format(Date.now(), "yyyy.MM.dd")}.${build}`

        if (
          !("version" in module) ||
          build > parseInt(module.version.replace(/^.+\./, ""))
        ) {
          module.version = version

          fs.writeFileSync(f, JSON.stringify(module, null, 2))
        }
      }

      module.url = f.replace("src/pages", "").replace(".json", "")
      //const name = f.replace(/^.+\//, "").replace(".json", "")
      ms.modules.push(module)
    })

  if (ms.modules.length > 0) {
    modules.push(ms)
  }
}

console.log(`--------------------`)
console.log(`Discovering modules`)
console.log(`--------------------`)
console.log(`dir: ${DIR}`)

let modules = []

walk(DIR, modules)

const now = Date.now()

modules = {
  collections: modules,
  updated: datefns.format(now, "yyyy/MM/dd HH:mm:ss"),
}

fs.writeFileSync("public/modules.json", JSON.stringify(modules, null, 2))

console.log(`Finished.`)
