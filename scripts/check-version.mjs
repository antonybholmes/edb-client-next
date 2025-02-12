import { format } from "date-fns"
import fs from "fs"

const config = JSON.parse(fs.readFileSync("./version.json"))

const currentVersion = config.version
let [major, minor, patch, build] = currentVersion.split(".")
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

const newVersion = `${major}.${minor}.${patch}.${build}`

if (newVersion !== currentVersion) {
  config.version = newVersion
  config.updated = format(new Date(), "LLL dd, yyyy")
  fs.writeFileSync("./version.json", JSON.stringify(config, null, 2))
  console.log(`Version updated to ${newVersion}`)
} else {
  console.log("No version update required")
}
