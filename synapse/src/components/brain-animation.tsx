"use client"

import { useEffect, useRef } from "react"

interface Neuron {
  x: number
  y: number
  connections: number[]
  pulses: {
    target: number
    progress: number
    speed: number
  }[]
  size: number
  glowIntensity: number
  glowDirection: number
}

export function BrainAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const updateCanvasSize = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }

    // Initial size
    updateCanvasSize()

    // Update on resize
    window.addEventListener("resize", updateCanvasSize)

    // Brain shape parameters
    const brainWidth = canvas.width * 0.6
    const brainHeight = canvas.height * 0.6
    const brainCenterX = canvas.width / 2
    const brainCenterY = canvas.height / 2

    // Create neurons
    const neuronCount = 120
    const neurons: Neuron[] = []

    // Create brain-shaped cluster of neurons
    for (let i = 0; i < neuronCount; i++) {
      // Parametric equations to create a brain-like shape
      const t = Math.random() * Math.PI * 2
      const r = Math.random() * 0.5 + 0.5 // 0.5 to 1.0

      // Basic ellipse
      let x = (Math.cos(t) * r * brainWidth) / 2
      let y = (Math.sin(t) * r * brainHeight) / 2

      // Add some randomness
      x += (Math.random() - 0.5) * brainWidth * 0.2
      y += (Math.random() - 0.5) * brainHeight * 0.2

      // Center in canvas
      x += brainCenterX
      y += brainCenterY

      neurons.push({
        x,
        y,
        connections: [],
        pulses: [],
        size: Math.random() * 2 + 1.5, // Random size between 1.5 and 3.5
        glowIntensity: Math.random() * 0.5, // Random initial glow
        glowDirection: Math.random() > 0.5 ? 1 : -1, // Random glow direction
      })
    }

    // Create connections between neurons
    neurons.forEach((neuron, i) => {
      // Find 2-5 closest neurons to connect to
      const connectionCount = Math.floor(Math.random() * 4) + 2

      // Calculate distances to all other neurons
      const distances = neurons
        .map((other, j) => {
          if (i === j) return { index: j, distance: Number.POSITIVE_INFINITY }
          const dx = neuron.x - other.x
          const dy = neuron.y - other.y
          return { index: j, distance: Math.sqrt(dx * dx + dy * dy) }
        })
        .sort((a, b) => a.distance - b.distance)

      // Connect to closest neurons
      for (let j = 0; j < Math.min(connectionCount, neurons.length - 1); j++) {
        neuron.connections.push(distances[j].index)
      }
    })

    // Create a pulsing brain outline
    let brainOutlineSize = 1.0
    let brainOutlineDirection = 0.001

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw pulsing brain outline
      brainOutlineSize += brainOutlineDirection
      if (brainOutlineSize > 1.05 || brainOutlineSize < 0.95) {
        brainOutlineDirection *= -1
      }

      ctx.beginPath()
      ctx.ellipse(
        brainCenterX,
        brainCenterY,
        (brainWidth / 2) * brainOutlineSize,
        (brainHeight / 2) * brainOutlineSize,
        0,
        0,
        Math.PI * 2,
      )
      ctx.strokeStyle = "rgba(135, 206, 250, 0.2)"
      ctx.lineWidth = 5
      ctx.stroke()

      // Draw a second outline for effect
      ctx.beginPath()
      ctx.ellipse(
        brainCenterX,
        brainCenterY,
        (brainWidth / 2 + 15) * brainOutlineSize,
        (brainHeight / 2 + 15) * brainOutlineSize,
        0,
        0,
        Math.PI * 2,
      )
      ctx.strokeStyle = "rgba(135, 206, 250, 0.1)"
      ctx.lineWidth = 10
      ctx.stroke()

      // Draw connections
      neurons.forEach((neuron) => {
        neuron.connections.forEach((targetIndex) => {
          // Make sure the target index is valid
          if (targetIndex >= 0 && targetIndex < neurons.length) {
            const target = neurons[targetIndex]
            if (target) {
              // Safety check to ensure target exists
              ctx.beginPath()
              ctx.moveTo(neuron.x, neuron.y)
              ctx.lineTo(target.x, target.y)

              // Create gradient for connections
              const gradient = ctx.createLinearGradient(neuron.x, neuron.y, target.x, target.y)
              gradient.addColorStop(0, `rgba(173, 216, 230, ${0.1 + neuron.glowIntensity * 0.2})`)
              gradient.addColorStop(1, `rgba(173, 216, 230, ${0.1 + target.glowIntensity * 0.2})`)

              ctx.strokeStyle = gradient
              ctx.lineWidth = 1
              ctx.stroke()
            }
          }
        })
      })

      // Draw neurons with glow effect
      neurons.forEach((neuron) => {
        // Update glow intensity
        neuron.glowIntensity += 0.01 * neuron.glowDirection
        if (neuron.glowIntensity > 1 || neuron.glowIntensity < 0) {
          neuron.glowDirection *= -1
        }

        // Draw glow
        const glow = ctx.createRadialGradient(neuron.x, neuron.y, 0, neuron.x, neuron.y, neuron.size * 4)
        glow.addColorStop(0, `rgba(135, 206, 250, ${0.5 * neuron.glowIntensity})`)
        glow.addColorStop(1, "rgba(135, 206, 250, 0)")

        ctx.beginPath()
        ctx.arc(neuron.x, neuron.y, neuron.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Draw neuron
        ctx.beginPath()
        ctx.arc(neuron.x, neuron.y, neuron.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(135, 206, 250, ${0.7 + neuron.glowIntensity * 0.3})`
        ctx.fill()
      })

      // Update and draw pulses
      neurons.forEach((neuron) => {
        // Randomly create new pulses
        if (Math.random() < 0.02 && neuron.connections.length > 0) {
          const targetIndex = neuron.connections[Math.floor(Math.random() * neuron.connections.length)]
          // Make sure the target index is valid
          if (targetIndex >= 0 && targetIndex < neurons.length) {
            neuron.pulses.push({
              target: targetIndex,
              progress: 0,
              speed: Math.random() * 0.02 + 0.01, // Random speed
            })
          }
        }

        // Update existing pulses
        neuron.pulses = neuron.pulses.filter((pulse) => {
          pulse.progress += pulse.speed

          if (pulse.progress >= 1) return false

          // Make sure the target index is valid
          if (pulse.target < 0 || pulse.target >= neurons.length) return false

          const target = neurons[pulse.target]
          // Safety check to ensure target exists
          if (!target) return false

          const x = neuron.x + (target.x - neuron.x) * pulse.progress
          const y = neuron.y + (target.y - neuron.y) * pulse.progress

          // Draw pulse with trail effect
          const pulseSize = 3 * (1 - Math.abs(pulse.progress - 0.5) * 0.5)

          // Draw pulse glow
          const glow = ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 3)
          glow.addColorStop(0, "rgba(30, 144, 255, 0.6)")
          glow.addColorStop(1, "rgba(30, 144, 255, 0)")

          ctx.beginPath()
          ctx.arc(x, y, pulseSize * 3, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()

          // Draw pulse
          ctx.beginPath()
          ctx.arc(x, y, pulseSize, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(30, 144, 255, 0.8)"
          ctx.fill()

          return true
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }} />
}
