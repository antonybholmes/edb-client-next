import { format } from 'date-fns'
import fs from 'fs'
import path from 'path'

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

const files: string[] = []
getAllFiles('src/', files)

const info = JSON.parse(fs.readFileSync('./version.json', 'utf-8'))

const currentDate = info.modified ? new Date(info.modified) : undefined

// find largest mod time by recursively checking all files
const [, modDate] = files
  .filter(f => f.match(/(\.ts|\.tsx|\.js|\.jsx|\.astro)/))
  .map(f => {
    const stats = fs.lstatSync(f)
    return [f, stats.mtime] as [string, Date]
  })
  .sort((a, b) => b[1]!.getTime() - a[1]!.getTime())[0]!

if (!currentDate || modDate.getTime() > currentDate.getTime()) {
  const currentVersion = info.version
  let [major, minor, patch, build] = currentVersion.split('.')
  major = parseInt(major)
  minor = parseInt(minor)
  patch = parseInt(patch)
  build = parseInt(build)

  build++

  //if (build % 10 === 0) {
  patch++
  //}

  if (patch > 9) {
    patch = 0
    minor++
  }

  if (minor > 9) {
    minor = 0
    major++
  }

  // update version and modified date to latest file modification date
  const newVersion = `${major}.${minor}.${patch}.${build}`
  info.version = newVersion
  info.updated = format(new Date(), 'LLL dd, yyyy')
  info.modified = modDate.toISOString()
  fs.writeFileSync('./version.json', JSON.stringify(info, null, 2))

  console.log()
  console.log(`---- Version Update ----`)
  console.log()
  console.log(info)
  console.log()
  console.log(`---- End Version Update ----`)
  console.log()
}
