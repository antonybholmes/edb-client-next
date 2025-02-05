import { cn } from './class-names'
import type { UndefStr } from './text/text'

export type ClassVariant = Record<string, UndefStr>
type ClassVariants = Record<string, Record<string, UndefStr>>
type MultiVariants = Record<string, Record<string, string>>

interface IOptionProps {
  variants?: ClassVariants
  defaultVariants?: ClassVariant
  multiProps?: MultiVariants
}

export function cv(
  baseClassName?: string,
  opts?: IOptionProps
): (variants?: ClassVariant) => UndefStr {
  let _cvMap: ClassVariants = {}
  let _dvMap: ClassVariant = {}
  let _mvMap: MultiVariants = {}

  if (opts) {
    const { variants, defaultVariants, multiProps } = opts

    _cvMap = { ..._cvMap, ...variants }
    _dvMap = { ..._dvMap, ...defaultVariants }
    _mvMap = { ..._mvMap, ...multiProps }
  }

  return function (variants?: ClassVariant): UndefStr {
    // make life easier by ensuring variants is always
    // a map even if user doesn't specify it
    if (!variants) {
      variants = {}
    }

    const ret: string[] = []

    if (baseClassName) {
      ret.push(baseClassName)
    }

    // keep track of keys we have used
    const used = new Set<string>()

    // add user add hoc variants
    for (const [key, value] of Object.entries(variants)) {
      if (!used.has(key) && key in _cvMap && value && value in _cvMap[key]!) {
        if (_cvMap[key]![value]) {
          ret.push(_cvMap[key]![value])
        }
        used.add(key)
      }
    }

    // add multivariants
    if ('multiProps' in variants && variants['multiProps']) {
      for (let key of variants['multiProps'].split(/[ ,]/)) {
        key = key.trim()

        if (key in _mvMap) {
          for (const [multiKey, multiValue] of Object.entries(_mvMap[key]!)) {
            // the multi key represents a variant and the multivalue the variant type

            if (
              !used.has(multiKey) &&
              multiKey in _cvMap &&
              multiValue in _cvMap[multiKey]!
            ) {
              // Some variants are empty strings, i.e. no classes.
              // We don't add empty strings to our class lists, but
              // we log that the key has been used
              if (_cvMap[multiKey]![multiValue]) {
                ret.push(_cvMap[multiKey]![multiValue])
              }

              used.add(multiKey)
            }
          }
        }
      }
    }

    // Add default values if the user has not specified the variant
    // either through the ad-hoc method or via the multivariants.
    for (const [key, value] of Object.entries(_dvMap)) {
      // only add default key if not specified by user
      //console.log("default", key, value, !(key in variants), variants)

      if (!used.has(key) && value && key in _cvMap && value in _cvMap[key]!) {
        if (_cvMap[key]![value]) {
          ret.push(_cvMap[key]![value])
        }

        used.add(key)
      }
    }

    //console.log(ret)

    // finally allow user to specify classnames using the classname prop.
    // These are added last so can override anything that comes before them.
    if ('className' in variants && variants['className']) {
      ret.push(variants['className'])
    }

    return cn(ret)
  }
}
