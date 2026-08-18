import { useCallback, useRef, useState } from "react"
import * as THREE from "three"

export function useCapture(gl: THREE.WebGLRenderer) {
  const [isCapturingGif, setIsCapturingGif] = useState(false)
  const capturingRef = useRef(false)

  const takeScreenshot = useCallback(() => {
    const canvas = gl.domElement
    const dataUrl = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = `gesturelab-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [gl])

  const startGifCapture = useCallback(() => {
    if (capturingRef.current) {
      capturingRef.current = false
      return
    }

    capturingRef.current = true
    setIsCapturingGif(true)

    const canvas = gl.domElement
    const width = canvas.width
    const height = canvas.height

    const captureGif = async () => {
      const GIF = (await import("gif.js")).default
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width,
        height,
        workerScript: "./gif.worker.js",
      })

      const totalFrames = 30
      let captured = 0
      let renderTimeout: ReturnType<typeof setTimeout> | null = null

      const cleanup = () => {
        if (renderTimeout) clearTimeout(renderTimeout)
        capturingRef.current = false
        setIsCapturingGif(false)
      }

      return new Promise<void>((resolve) => {
        renderTimeout = setTimeout(() => {
          cleanup()
          resolve()
        }, 10000)

        gif.on("finished", (blob: Blob) => {
          if (renderTimeout) clearTimeout(renderTimeout)
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.download = `gesturelab-${Date.now()}.gif`
          link.href = url
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          cleanup()
          resolve()
        })

        gif.on("error", () => {
          cleanup()
          resolve()
        })

        const frame = () => {
          if (!capturingRef.current) {
            if (captured > 0) {
              gif.render()
            } else {
              cleanup()
              resolve()
            }
            return
          }
          const dataUrl = canvas.toDataURL("image/png")
          const img = new Image()
          img.onload = () => {
            const tempCanvas = document.createElement("canvas")
            tempCanvas.width = width
            tempCanvas.height = height
            const ctx = tempCanvas.getContext("2d")!
            ctx.drawImage(img, 0, 0)
            const imageData = ctx.getImageData(0, 0, width, height)
            gif.addFrame(imageData, { copy: true, delay: 100 })
            captured++
            if (captured >= totalFrames) {
              gif.render()
            } else {
              requestAnimationFrame(frame)
            }
          }
          img.src = dataUrl
        }
        requestAnimationFrame(frame)
      })
    }

    captureGif().catch(() => {
      capturingRef.current = false
      setIsCapturingGif(false)
    })
  }, [gl])

  return { takeScreenshot, startGifCapture, isCapturingGif }
}
