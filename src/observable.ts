import Atom from './Atom'
import createRootObservableRoot from './handlers'
import { IDecoratorPropsRestArgs, primitiveType } from './types'
import { invariant } from './utils'

// @observable('a', 'b', 'c')
// Class Model {...}
function createClassObservableDecorator(props: IDecoratorPropsRestArgs) {
  let pickedProps: string[] = props as string[]

  return function decorateClassObservable(TargetClass: any) {
    function wrap(...args: any[]) {
      return createRootObservableRoot(new TargetClass(...args), { pickedProps })
    }
    return wrap as any
  }
}

// @observable
// Class Model {...}
function decorateClassObservable(TargetClass: any) {
  function wrap(...args: any[]) {
    return createRootObservableRoot(new TargetClass(...args))
  }
  return wrap as any
}

export interface IObservableFactories {
  box<T extends primitiveType>(value: T): T
}

const observableFactories: IObservableFactories = {
  box<T extends primitiveType>(value: T) {
    if (process.env.NODE_ENV !== 'production') {
      invariant(
        value === 'object',
        `do not use \`observable.box\` to make a primitive value to be observable, use observable directly.`
      )
    }
    return createRootObservableRoot(value)
  }
}

export function observable<T>(target: T): T
export function observable(...props: IDecoratorPropsRestArgs): ClassDecorator
export function observable(...props: IDecoratorPropsRestArgs): any {
  const [arg1, ...otherArgs] = props

  // observable(model)
  if (typeof arg1 === 'object' && props.length === 1) {
    return createRootObservableRoot(arg1) as any
  }

  // @observable
  // Class Model {...}
  if (typeof arg1 === 'function' && props.length === 1) {
    return decorateClassObservable(arg1)
  }

  // @observable('a', 'b', 'c')
  // Class Model {...}
  if (props.length > 1) {
    // return decorateClassObservable(arg1)
    return createClassObservableDecorator(props)
  }

  if (process.env.NODE_ENV !== 'production') {
    invariant(`only accept an plain object or a Class.`)
  }
}

Object.keys(observableFactories).forEach(name => (observable[name] = observableFactories[name]))
