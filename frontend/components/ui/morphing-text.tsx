'use client'

import type { FC } from 'react'
import { useCallback, useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

const morphTime = 1.5
const cooldownTime = 0.5

const clampBlur = (value: number) => {
  if (!Number.isFinite(value)) return 100
  return Math.min(Math.max(value, 0), 100)
}

const useMorphingText = (texts: string[]) => {
  const textIndexRef = useRef(0)
  const morphRef = useRef(0)
  const cooldownRef = useRef(0)
  const timeRef = useRef(new Date())

  const text1Ref = useRef<HTMLSpanElement>(null)
  const text2Ref = useRef<HTMLSpanElement>(null)

  const setStyles = useCallback(
    (fraction: number) => {
      const current1 = text1Ref.current
      const current2 = text2Ref.current
      if (!current1 || !current2 || texts.length === 0) return

      const nextFraction = Math.max(Math.min(fraction, 1), 0.0001)
      const blurCurrent = clampBlur(8 / nextFraction - 8)
      const opacityCurrent = Math.pow(nextFraction, 0.4) * 100

      const invertedFraction = Math.max(Math.min(1 - fraction, 1), 0.0001)
      const blurPrev = clampBlur(8 / invertedFraction - 8)
      const opacityPrev = Math.pow(invertedFraction, 0.4) * 100

      current2.style.filter = `blur(${blurCurrent}px)`
      current2.style.opacity = `${opacityCurrent}%`

      current1.style.filter = `blur(${blurPrev}px)`
      current1.style.opacity = `${opacityPrev}%`

      const safeIndex = ((textIndexRef.current % texts.length) + texts.length) % texts.length
      current1.textContent = texts[safeIndex]
      current2.textContent = texts[(safeIndex + 1) % texts.length]
    },
    [texts]
  )

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current
    cooldownRef.current = 0

    let fraction = morphRef.current / morphTime

    if (fraction > 1) {
      cooldownRef.current = cooldownTime
      fraction = 1
    }

    setStyles(fraction)

    if (fraction === 1) {
      textIndexRef.current += 1
    }
  }, [setStyles])

  const doCooldown = useCallback(() => {
    morphRef.current = 0
    const current1 = text1Ref.current
    const current2 = text2Ref.current
    if (current1 && current2) {
      current2.style.filter = 'none'
      current2.style.opacity = '100%'
      current1.style.filter = 'none'
      current1.style.opacity = '0%'
    }
  }, [])

  useEffect(() => {
    if (!texts.length) return

    let animationFrameId: number

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const newTime = new Date()
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000
      timeRef.current = newTime

      cooldownRef.current -= dt

      if (cooldownRef.current <= 0) {
        morphRef.current += dt
        doMorph()
      } else {
        doCooldown()
      }
    }

    animate()
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [doMorph, doCooldown, texts])

  return { text1Ref, text2Ref }
}

interface MorphingTextProps {
  className?: string
  texts: string[]
}

const Texts: FC<Pick<MorphingTextProps, 'texts'>> = ({ texts }) => {
  const { text1Ref, text2Ref } = useMorphingText(texts)
  return (
    <>
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text1Ref}
      />
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text2Ref}
      />
    </>
  )
}

const SvgFilters: FC = () => (
  <svg
    id="filters"
    className="fixed h-0 w-0"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <filter id="threshold">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
)

export const MorphingText: FC<MorphingTextProps> = ({
  texts,
  className,
}) => (
  <div
    className={cn(
      'relative mx-auto h-16 w-full max-w-screen-md text-center font-sans text-[40pt] leading-none font-bold [filter:url(#threshold)_blur(0.6px)] md:h-24 lg:text-[6rem]',
      className
    )}
  >
    <Texts texts={texts} />
    <SvgFilters />
  </div>
)
