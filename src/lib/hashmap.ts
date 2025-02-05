export class HashMap<K, V> extends Map<K, V> {
  override get(key: K, defaultValue: V | undefined = undefined) {
    if (super.has(key)) {
      return super.get(key)
    }

    return defaultValue
  }
}
