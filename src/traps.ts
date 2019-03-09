import Atom from './Atom'
import { $atomOfProxy, $getOriginSource, $isProxied } from './types'
import { isPrimitive } from './utils'

const createTraps = (): ProxyHandler<Atom> => {
  return {
    get(atom, prop, receiver) {
      // get value from source proxy
      const value = atom.get(prop)
      // TODO: use Switch
      if (prop === $isProxied) {
        return true
      }

      if (prop === $atomOfProxy) {
        return atom
      }

      if (prop === $getOriginSource) {
        return value
      }

      // if it's already proxied, directly return the proxy
      // TODO: prop could be string | number | symbol, but now only consider string
      // FIXME: this is not deeply non-observable, it just avoid one level observable proxy
      if (atom.pickedProps.length > 0 && atom.pickedProps.indexOf(prop.toString()) < 0) {
        return value
      }

      // if it's already proxied, directly return the proxy
      if (atom.isPropProxied(prop as any)) {
        const existAtom = atom.proxiedProps[prop]
        return existAtom.proxy
      }

      // primitive value: recursive end
      if (isPrimitive(value)) {
        return value
      }

      // method: recursive end
      if (typeof value === 'function') {
        return value
      }

      // recursive proxy
      const childAtom = new Atom(value)
      const childProxy = new Proxy<Atom>(childAtom, createTraps())
      childAtom.proxy = childProxy
      atom.addProxiedProp(prop as any, childAtom)
      return childProxy
    },
    set(atom, prop, value, receiver) {
      atom.set(prop, value)
      return true
    },
    ownKeys(atom) {
      // TODO: bug with `Object.keys`
      const keys = Reflect.ownKeys(atom.source)
      return keys
    }
  }
}

export default createTraps
