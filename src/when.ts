import { resetCurrCollectingReactionEffect, SideEffect, unshiftCurrCollectingReactionEffect } from './observer'

export type predicateType = () => boolean

export const when = (predicate: predicateType, fn: Function) => {
  const sideEffect = new SideEffect('reaction', fn)
  sideEffect.predictFn = predicate
  // `predicate` function will collect dependencies
  // `fn` is the real callback will be triggered
  unshiftCurrCollectingReactionEffect(sideEffect)
  predicate()
  resetCurrCollectingReactionEffect()
}
