const MIN_DEPTH_STORE_VARIABLES = 1

export class TrieNode<T> {
  private _key: string
  private _parent: TrieNode<T> | null
  private _children: Map<string, TrieNode<T>>
  private _values: Set<T>
  private _depth: number

  constructor(parent: TrieNode<T> | null, key: string) {
    this._key = key
    this._parent = parent
    this._depth = parent ? parent.depth + 1 : 0

    this._children = new Map<string, TrieNode<T>>()
    this._values = new Set<T>()
  }

  addNodes(key: string, value: T) {
    TrieNode._addNodes(this, key, value)
  }

  // addValue(value: T) {
  //   if (this._depth > MIN_DEPTH_STORE_VARIABLES) {
  //     this._values.add(value)
  //   }
  // }

  find(key: string): T[] {
    key = key.toLowerCase()

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: TrieNode<T> = this

    for (const c of key.slice()) {
      if (!node._children.has(c)) {
        return []
      }

      node = node._children.get(c)!
    }

    return Array.from(node._values).sort()
  }

  get key(): string {
    return this._key
  }

  get depth(): number {
    return this._depth
  }

  get parent(): TrieNode<T> | null {
    return this._parent
  }

  static _addNodes<T>(parent: TrieNode<T>, key: string, value: T) {
    if (key.length === 0) {
      return
    }

    const words = key
      .replaceAll(/[^A-Za-z0-9]/g, ' ')
      .split(' ')
      .filter(word => word.length > MIN_DEPTH_STORE_VARIABLES)

    //if (key.includes("BCL6")) {
    // console.log(words)
    //}

    words.forEach(word => {
      //console.log("add", key.slice(i))
      TrieNode._addNodesRec(parent, word, value)
    })

    // build tree by using every substring from
    // left to right as the search key. That way
    // if we want to search for L6 in BCL6, we
    // can
    // range(key.length - 1).forEach(i => {
    //   //console.log("add", key.slice(i))
    //   this._add(key.slice(i), value)
    // })
  }

  static _addNodesRec<T>(parent: TrieNode<T>, key: string, value: T) {
    // if the key is not a string, then we have
    // no more children to create
    if (key.length === 0) {
      return
    }

    key = key.toLowerCase()

    const c = key.charAt(0)

    if (!parent._children.has(c)) {
      parent._children.set(c, new TrieNode<T>(parent, c))
    }

    const child = parent._children.get(c)!

    if (child._depth > MIN_DEPTH_STORE_VARIABLES) {
      child._values.add(value)
    }

    //console.log(c, key.slice(1), parent, parent._parent, parent._depth)

    // recursively build tree using tail of key

    TrieNode._addNodesRec(child, key.slice(1), value)
  }
}

export class RootTrieNode<T> extends TrieNode<T> {
  constructor() {
    super(null, '')
  }
}
