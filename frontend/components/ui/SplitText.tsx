'use client'

import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText as GSAPSplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP)

type SplitVariant = 'chars' | 'words' | 'lines' | 'words, chars'

type SupportedTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'

export interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  ease?: string | ((t: number) => number)
  splitType?: SplitVariant
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  threshold?: number
  rootMargin?: string
  tag?: SupportedTag
  textAlign?: React.CSSProperties['textAlign']
  onLetterAnimationComplete?: () => void
}

const defaultFrom: gsap.TweenVars = { opacity: 0, y: 40 }
const defaultTo: gsap.TweenVars = { opacity: 1, y: 0 }

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = defaultFrom,
  to = defaultTo,
  threshold = 0.1,
  rootMargin = '-100px',
  tag = 'p',
  textAlign = 'center',
  onLetterAnimationComplete,
}) => {
  const ref = useRef<HTMLElement | null>(null)
  const animationCompletedRef = useRef(false)
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined' || !('fonts' in document)) {
      setFontsLoaded(true)
      return
    }

    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true)
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true)
      })
    }
  }, [])

  useGSAP(
    () => {
      const el = ref.current
      if (!el || !text || !fontsLoaded) return

      const typedEl = el as HTMLElement & {
        _rbsplitInstance?: GSAPSplitText
      }

      if (typedEl._rbsplitInstance) {
        try {
          typedEl._rbsplitInstance.revert()
        } catch (error) {
          console.error(error)
        }
        typedEl._rbsplitInstance = undefined
      }

      const startPct = (1 - threshold) * 100
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin)
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px'
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`
      const start = `top ${startPct}%${sign}`

      let targets: Element[] = []
      const assignTargets = (instance: GSAPSplitText) => {
        if (splitType.includes('chars') && instance.chars?.length) targets = instance.chars
        if (!targets.length && splitType.includes('words') && instance.words?.length) targets = instance.words
        if (!targets.length && splitType.includes('lines') && instance.lines?.length) targets = instance.lines
        if (!targets.length) targets = instance.chars || instance.words || instance.lines || []
      }

      const splitInstance = new GSAPSplitText(typedEl, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (instance: GSAPSplitText) => {
          assignTargets(instance)
          return gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: typedEl,
                start,
                once: true,
                fastScrollEnd: true,
                anticipatePin: 0.4,
              },
              onComplete: () => {
                if (!animationCompletedRef.current) {
                  animationCompletedRef.current = true
                  onLetterAnimationComplete?.()
                }
              },
              willChange: 'transform, opacity',
              force3D: true,
            }
          )
        },
      })

      typedEl._rbsplitInstance = splitInstance

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === typedEl) trigger.kill()
        })
        try {
          splitInstance.revert()
        } catch (error) {
          console.error(error)
        }
        typedEl._rbsplitInstance = undefined
      }
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
        onLetterAnimationComplete,
      ],
      scope: ref,
    }
  )

  const sharedStyle: React.CSSProperties = {
    textAlign,
    wordWrap: 'break-word',
    willChange: 'transform, opacity',
  }

  const classes = `split-parent overflow-hidden inline-block whitespace-normal ${className}`

  const setNodeRef = (node: HTMLElement | null) => {
    ref.current = node
  }

  return React.createElement(
    tag,
    {
      ref: setNodeRef,
      style: sharedStyle,
      className: classes,
    },
    text
  )
}

export default SplitText
