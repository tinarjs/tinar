import Computed from './computed'
import { SideEffect } from './observer'
import IAtom from './traps'

let _atomId = 0
let _derivationId = 0
let _reactionId = 0
let _setDeep = 0

export const globalState = {
  rootCache: new WeakMap<Object, string[]>(),
  /**
   * indication is it in final reaction running
   */
  isRunningReactions: false,
  /**
   * how depth we are accessing in nested computed value
   */
  computedAccessDepth: 0,
  /**
   * is in transaction
   */
  isPendingTransaction: false,
  /**
   * transaction depth
   */
  // batchDepth: 0,
  /**
   * pending reactions
   */
  pendingReactions: new Set<SideEffect>(),
  /**
   * TODO: relationship with pending reactions?
   */
  simpleThunk: new Set<SideEffect>(),
  intoCom() {
    /* tslint:disable:no-invalid-this */
    globalState.computedAccessDepth++
  },
  leaveCom() {
    globalState.computedAccessDepth--
  },
  enterSet() {
    _setDeep++
  },
  exitSet() {
    _setDeep--
    if (_setDeep === 0) {
      // console.log('⬆️️️️️️️⬆️⬆️')
      _setDeep = -1 // HACK:
      globalState.isRunningReactions = true
      const computedNeedToUpdate: Computed[] = []
      globalState.simpleThunk.forEach((sideEffect: SideEffect) => {
        const currSideEffectDependencies = sideEffect.dependencies
        let shouldTrigger = false
        for (const dependency of currSideEffectDependencies) {
          shouldTrigger = true
          // if (dependency instanceof IAtom) {
          // shouldTrigger = true
          // if atom changed, it definitely got a change
          // do not need to check if should trigger anymore
          // break
          // }

          // if (dependency instanceof Computed) {
          // if (dependency.isStale() && !dependency.isEqual()) {
          //   computedNeedToUpdate.push(dependency)
          //   shouldTrigger = true
          // }
          // }
        }
        if (shouldTrigger) {
          sideEffect.runInTrack(sideEffect.runEffectWithPredict)
        }
      })
      // everything is done, gonna ending this updating
      computedNeedToUpdate.forEach(com => com.refreshValue())
      globalState.simpleThunk.clear()
      globalState.isRunningReactions = false
      _setDeep = 0
    }
  },
  /**
   * unique ID of Atom
   */
  allocateAtomId() {
    const currAtomId = _atomId
    _atomId++
    return `[atom] ${currAtomId}`
  },
  /**
   * unique ID of Derivation(Computed)
   */
  allocateDerivationId() {
    const currDerivationId = _derivationId
    _derivationId++
    return `[derivation] ${currDerivationId}`
  },
  /**
   * unique ID of Reaction
   */
  allocateReactionId() {
    const currReactionId = _reactionId
    _reactionId++
    return `[reaction] ${currReactionId}`
  }
}
