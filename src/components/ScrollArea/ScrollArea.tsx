import { useLayoutEffect, useRef } from 'react'
import type { ComponentPropsWithRef, PointerEvent } from 'react'
import styles from './ScrollArea.module.css'

type ScrollAreaProps = ComponentPropsWithRef<'div'> & {
  viewportClassName?: string
  contentClassName?: string
}

const gutter = 5

export function ScrollArea({ className, viewportClassName, contentClassName, ref, children, onScroll, ...props }: ScrollAreaProps) {
  const viewport = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLDivElement>(null)
  const grab = useRef<number | null>(null)

  function measure() {
    const port = viewport.current
    const rail = track.current
    const marker = thumb.current
    if (!port || !rail || !marker) return
    const range = port.scrollHeight - port.clientHeight
    const height = port.clientHeight - gutter * 2
    const size = Math.min(height, Math.max(26, height * port.clientHeight / port.scrollHeight))
    rail.hidden = range <= 1 || height <= 0
    if (rail.hidden) return
    marker.style.blockSize = size + 'px'
    marker.style.transform = 'translateY(' + (height - size) * (port.scrollTop / range) + 'px)'
  }

  useLayoutEffect(() => {
    const observer = new ResizeObserver(measure)
    if (viewport.current) observer.observe(viewport.current)
    if (content.current) observer.observe(content.current)
    measure()
    return () => observer.disconnect()
  }, [])

  function seek(event: PointerEvent<HTMLDivElement>) {
    const port = viewport.current
    const marker = thumb.current
    if (!port || !marker || grab.current === null) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const travel = bounds.height - marker.offsetHeight
    const ratio = travel > 0 ? (event.clientY - bounds.top - grab.current) / travel : 0
    port.scrollTop = Math.max(0, Math.min(1, ratio)) * (port.scrollHeight - port.clientHeight)
  }

  return <div className={className ? styles.area + ' ' + className : styles.area}>
    <div {...props} className={viewportClassName ? styles.viewport + ' ' + viewportClassName : styles.viewport}
      data-raya-scroll="" tabIndex={props.tabIndex ?? 0}
      ref={element => {
        viewport.current = element
        if (typeof ref === 'function') ref(element)
        else if (ref) ref.current = element
      }}
      onScroll={event => {
        measure()
        onScroll?.(event)
      }}>
      <div ref={content} className={contentClassName ? styles.content + ' ' + contentClassName : styles.content}>{children}</div>
    </div>
    <div className={styles.track} ref={track} data-scrollbar="" aria-hidden="true" hidden
      onPointerDown={event => {
        const marker = thumb.current
        if (!marker || event.button !== 0) return
        event.preventDefault()
        grab.current = event.target === marker ? event.clientY - marker.getBoundingClientRect().top : marker.offsetHeight / 2
        event.currentTarget.setPointerCapture(event.pointerId)
        seek(event)
      }}
      onPointerMove={seek}
      onLostPointerCapture={() => { grab.current = null }}>
      <div ref={thumb} className={styles.thumb} />
    </div>
  </div>
}
