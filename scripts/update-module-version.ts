import fs from 'fs'
import path from 'path'

const DIR = 'src/components/pages/apps'

function getAllFiles(dir: string, files: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files)
    } else {
      files.push(fullPath)
    }
  }

  return files
}

function walk(dir: string) {
  //console.log("walk", dir)

  const dirs: string[] = []
  const files: string[] = []

  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const f = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      dirs.push(f)
    } else {
      files.push(f)
    }
  })

  // prioritize dirs
  dirs.forEach(d => walk(d))

  const moduleFiles = files.filter(f => f.includes('module.json'))

  if (moduleFiles.length === 0) {
    // not a proper module
    return
  }

  const moduleFile = moduleFiles[0]!

  const info = JSON.parse(fs.readFileSync(moduleFile, 'utf-8'))

  // find largest mod time by recursively checking all  files
  // in the current directory and subdirectories
  const filesInDir: string[] = []
  getAllFiles(dir, filesInDir) //fs.readdirSync(dir).map(f => path.join(dir, f))

  const [, modDate] = filesInDir
    .filter(f => f.match(/(\.ts|\.tsx|\.js|\.jsx|\.astro)/))
    .map(f => {
      const stats = fs.lstatSync(f)

      //console.log(format(stats.mtime, "yyyy MM dd"))
      return [f, stats.mtime] as [string, Date]
    })
    .sort((a, b) => b[1]!.getTime() - a[1]!.getTime())[0]!

  // if (!info.modified) {
  //   info.modified = modDate.toISOString()
  // }

  if (info.version === '1.0.0') {
    info.version = '1.0.0.0'
  }

  const currentModDate = info.modified ? new Date(info.modified) : undefined

  //console.log("what", info, currentModDate, modDate)

  if (!currentModDate || modDate.getTime() > currentModDate.getTime()) {
    let [major, minor, patch, build] = info.version.split('.')
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

console.log()
console.log(`---- Updating module versions ----`)
console.log(`dir: ${DIR}`)
console.log()

walk(DIR)

console.log()
console.log(`---- End updating module versions ----`)
console.log()
