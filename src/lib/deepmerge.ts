export function isObj(v: unknown): v is Record<string, any> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function deepMerge<T>(defaults: T, saved: unknown): T {
  if (Array.isArray(defaults)) {
    return (Array.isArray(saved) ? saved : defaults) as T
  }

  if (isObj(defaults)) {
    if (!isObj(saved)) {
      return defaults
    }

    // empty default object = dynamic-key record, keep whatever was saved
    if (Object.keys(defaults).length === 0) {
      return saved as T
    }

    return Object.fromEntries(
      Object.keys(defaults).map((k) => [k, deepMerge(defaults[k], saved[k])])
    ) as T
  }

  if (defaults == null) {
    return (saved ?? defaults) as T
  }

  // if the saved value's type no longer matches the default's
  // (e.g. string -> number), discard it and use the default
  return (typeof defaults !== typeof saved ? defaults : saved) as T
}
