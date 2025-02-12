// export function clean(cn: string) {
//   // replace multi spaces globally and ignore new lines
//   return cn.replace(/(\s+|\r\n|\n|\r)/gm, " ").trim()
// }

const SPLIT_REGEX = /[\s\t\r\n]+/

type CSSClass =
  | string
  | number
  | object
  | undefined
  | null
  | boolean
  | CSSClass[]
  | [boolean, CSSClass]
  | [boolean, CSSClass, CSSClass]

function _cn(args: CSSClass, classes: string[], used: Set<string>) {
  if (!args) {
    return
  }

  if (typeof args === 'object') {
    if (Array.isArray(args)) {
      if (typeof args[0] === 'boolean') {
        // we need at least 2 args
        if (args.length > 2) {
          if (args[0]) {
            _cn(args[1], classes, used)
          } else {
            _cn(args[2], classes, used)
          }
        } else if (args.length > 1) {
          // only include class if arg true
          if (args[0]) {
            _cn(args[1], classes, used)
          }
        } else {
          // do nothing
        }
      } else {
        // regular array, so add all classes as normal
        for (const arg of args) {
          _cn(arg, classes, used)
        }
      }
    } else {
      // add keys whose values evaluate to true
      for (const [key, value] of Object.entries(args)) {
        if (value) {
          _cn(key, classes, used)
        }
      }
    }
  } else {
    // only append string and number primitives
    if (args && (typeof args === 'string' || typeof args === 'number')) {
      // add non repeating class names in the order they are
      // given
      for (let c of args.toString().split(SPLIT_REGEX)) {
        c = c.trim()

        if (c.length > 0 && !used.has(c)) {
          classes.push(c)
          used.add(c)
        }
      }
    }
  }
}

/**
 * Concatenates strings of class names together to form a class name string.
 * Useful for breaking up long tailwind class strings.
 * Also adds conditional rendering. [condition, 'classes'] will only add the
 * classes if condition is true. [condition, 'classes1', 'classes2'] adds
 * classes1 or classes2 conditionally. Also supports recursive conditionals.
 * [condition1, [condition2, 'classes1', 'classes2'], 'classes3'].
 *
 * @param args string or array of strings of classnames. Also supports condition c
 * @returns a space separated string of class names.
 */
export function cn(...args: CSSClass[]): string {
  const classes: string[] = []
  const used: Set<string> = new Set()

  _cn(args, classes, used)

  // join all the pieces into one then split on space
  // and remove duplicates
  return Array.from(classes).sort().join(' ')
}
