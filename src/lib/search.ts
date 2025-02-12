const OPERATORS: { [key: string]: { prec: number; assoc: 'l' | 'r' } } = {
  AND: {
    prec: 6,
    assoc: 'l',
  },
  OR: {
    prec: 5,
    assoc: 'l',
  },
  '^': {
    prec: 4,
    assoc: 'r',
  },
  '*': {
    prec: 3,
    assoc: 'l',
  },
  '/': {
    prec: 3,
    assoc: 'l',
  },
  '+': {
    prec: 2,
    assoc: 'l',
  },
  '-': {
    prec: 2,
    assoc: 'l',
  },
}

type StackOp = 'search' | 'AND' | 'OR' | '(' | ')'

function isOp(v: string): boolean {
  v = v.toLowerCase()

  return (
    v === 'and' ||
    v === 'or' ||
    v === '(' ||
    v === ')' ||
    v === '|' ||
    v === '||' ||
    v === '+'
  )
}

interface ISearchNode {
  v: string
  op: StackOp
}

export function toRPN(input: string): ISearchNode[] {
  const opStack: StackOp[] = []

  const output: ISearchNode[] = []

  const peek = () => {
    return opStack.at(-1)
  }

  input = input
    //.trim()
    //.replaceAll(/(\&+|\++)/gi, ' AND ')
    //.replaceAll(/\|+/gi, ' OR ')
    //.replaceAll(/\s+/g, ' AND ')
    //.replaceAll(/AND\s+OR\s+AND/g, 'OR')
    //.replaceAll(/AND(\s+AND)+/g, 'AND')
    .replaceAll('(', ' ( ')
    .replaceAll(')', ' ) ')
    //.replaceAll(/\s+/g, ' ')
    .trim()

  const tokens: string[] = input.split(/\s+/)
  const result: string[] = []

  for (const [tokeni, token] of tokens.entries()) {
    // If the current word is 'or', add it directly
    if (isOp(token)) {
      result.push(
        token
          .toUpperCase()
          .replace('+', 'AND')
          .replace('|', 'OR')
          .replace('||', 'OR')
      )
    } else {
      // Add the word to the result
      result.push(token)

      // If the next word is not 'or' and is not the last word, add 'and'
      if (tokeni < tokens.length - 1 && !isOp(tokens[tokeni + 1]!)) {
        result.push('AND')
      }
    }
  }

  //console.log(result)
  let topOfOpStack: StackOp | undefined

  for (const token of result) {
    switch (token) {
      case 'AND':
      case 'OR':
        const o1 = token
        topOfOpStack = peek() // look at the top of the stack (last element of the array)

        while (
          topOfOpStack !== undefined &&
          topOfOpStack !== '(' &&
          (OPERATORS[topOfOpStack]!.prec > OPERATORS[o1]!.prec ||
            (OPERATORS[topOfOpStack]!.prec === OPERATORS[o1]!.prec &&
              OPERATORS[o1]!.assoc === 'l'))
        ) {
          output.push({ v: '', op: opStack.pop() ?? 'AND' })
          topOfOpStack = peek()
        }
        opStack.push(o1)
        break

      case '(':
        opStack.push(token)
        break
      case ')':
        topOfOpStack = peek()
        while (topOfOpStack !== '(') {
          //assert(stack.length !== 0);
          output.push({ v: '', op: opStack.pop() ?? 'AND' })
          topOfOpStack = peek()
        }
        //assert(peek() === '(');
        opStack.pop()
        break
      default:
        output.push({ v: token, op: 'search' })
        break
    }
  }

  while (opStack.length !== 0) {
    output.push({ v: '', op: opStack.pop() ?? 'AND' })
  }

  //console.log(output)

  return output
}

export class SearchQuery {
  private _rpn: ISearchNode[]
  private _caseSensitive: boolean

  constructor(exp: string, caseSensitive: boolean = false) {
    this._caseSensitive = caseSensitive
    this._rpn = toRPN(caseSensitive ? exp : exp.toLowerCase())

    //console.log(this._rpn)
  }

  search(query: string): boolean {
    if (!this._caseSensitive) {
      query = query.toLowerCase()
    }

    const stack: boolean[] = []
    let v1: boolean
    let v2: boolean

    for (const n of this._rpn) {
      switch (n.op) {
        case 'AND':
          if (stack.length > 1) {
            v2 = stack.pop()!
            v1 = stack.pop()!
            stack.push(v1 && v2)
          }
          break
        case 'OR':
          if (stack.length > 1) {
            v2 = stack.pop()!
            v1 = stack.pop()!
            stack.push(v1 || v2)
          }
          break
        default:
          //search

          stack.push(query.includes(n.v)) //search))

          break
      }
    }

    if (stack.length > 0) {
      return stack.pop()!
    } else {
      // parse went wrong
      return false
    }
  }
}
