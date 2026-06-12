import { useState, useRef, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { getDelay } from '../utils/speed'

export function useAnimationRunner() {
  const [running, setRunning] = useState(false)
  const abortRef = useRef(false)

  const run = useCallback(async (generator, onStep, speed = 4) => {
    abortRef.current = false
    setRunning(true)
    const delay = getDelay(speed)

    try {
      for (const step of generator) {
        if (abortRef.current) break
        flushSync(() => onStep(step))
        const stepDelay = delay + (step.extraDelay ?? 0)
        await new Promise(r => setTimeout(r, stepDelay))
      }
    } catch (err) {
      console.error('Animation error:', err)
    } finally {
      setRunning(false)
    }
  }, [])

  const stop = useCallback(() => {
    abortRef.current = true
    setRunning(false)
  }, [])

  return { running, run, stop }
}

export function useStepRunner() {
  const [running, setRunning] = useState(false)
  const abortRef = useRef(false)

  const runSteps = useCallback(async (steps, onStep, speed = 4) => {
    abortRef.current = false
    setRunning(true)
    const delay = getDelay(speed)

    try {
      for (const step of steps) {
        if (abortRef.current) break
        flushSync(() => onStep(step))
        await new Promise(r => setTimeout(r, delay))
      }
    } catch (err) {
      console.error('Animation error:', err)
    } finally {
      setRunning(false)
    }
  }, [])

  const stop = useCallback(() => {
    abortRef.current = true
    setRunning(false)
  }, [])

  return { running, runSteps, stop }
}
