import fs from "fs"
import path from "path"

const DIR = "src/components/pages/modules"

function walk(dir) {
  //console.log("walk", dir)

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

  // prioritize dirs
  dirs.forEach(d => walk(d))

 
  let moduleFile = files.filter(f => f.includes("module.json"))

  if (moduleFile.length === 0) {
    // not a proper module
    return
  }

  moduleFile = moduleFile[0]

  const info = JSON.parse(fs.readFileSync(moduleFile))

  // find largest mod time

  const [, modDate] = files
    .filter(f => f.match(/(\.ts|\.tsx)/))
    .map(f => {
      const stats = fs.lstatSync(f)

      //console.log(format(stats.mtime, "yyyy MM dd"))
      return [f, stats.mtime]
    })
    .sort((a, b) => b[1] - a[1])[0]

  // if (!info.modified) {
  //   info.modified = modDate.toISOString()
  // }

  if (info.version === "1.0.0") {
    info.version = "1.0.1.42"
  }

  const currentModDate = info.modified ? new Date(info.modified) : undefined

  //console.log("what", info, currentModDate, modDate)

  if (!currentModDate || modDate.getTime() !== currentModDate.getTime()) {
    let [major, minor, patch, build] = info.version.split(".")
    major = parseInt(major)
    minor = parseInt(minor)
    patch = parseInt(patch)
    build = parseInt(build)

    build++

    patch++

    if (patch > 9) {
      patch = 0
      minor++
    }

    if (minor > 9) {
      minor = 0
      major++
    }

    info.version = `${major}.${minor}.${patch}.${build}`

    info.modified = modDate.toISOString()

    console.log(info)
  }

  //console.log(module)
  //console.log(info)
  //console.log(modFile, modDate)

  fs.writeFileSync(moduleFile, JSON.stringify(info, null, 2))
}

console.log(`---------------`)
console.log(`Updating modules`)
console.log(`---------------`)
console.log(`dir: ${DIR}`)

walk(DIR)

console.log(`Finished.`)
