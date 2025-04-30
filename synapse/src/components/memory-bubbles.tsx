"use client"

import { useEffect, useRef } from "react"

interface MemoryBubble {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  text: string
  color: string
  rotation: number
  rotationSpeed: number
}

const memoryTexts = [
  "First day of school",
  "Wedding day",
  "Graduation",
  "Family vacation",
  "Birthday party",
  "First job",
  "Road trip",
  "New home",
  "Baby's first steps",
  "Anniversary",
  "Concert night",
  "Hiking adventure",
  "Cooking together",
  "Beach sunset",
  "Holiday gathering",
  "First kiss",
  "Promotion",
  "Reunion",
  "Game night",
  "Stargazing",
]

export function MemoryBubbles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const bubblesRef = useRef<MemoryBubble[]>([])

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

    // Colors for bubbles
    const bubbleColors = [
      "rgba(173, 216, 230, 0.7)", // Light blue
      "rgba(135, 206, 250, 0.7)", // Sky blue
      "rgba(30, 144, 255, 0.7)", // Dodger blue
      "rgba(100, 149, 237, 0.7)", // Cornflower blue
      "rgba(176, 224, 230, 0.7)", // Powder blue
    ]

    // Function to create a new bubble
    const createBubble = () => {
      const size = Math.random() * 60 + 40
      const x = Math.random() * canvas.width
      const y = canvas.height + size

      const newBubble: MemoryBubble = {
        x,
        y,
        size,
        opacity: 0,
        speed: Math.random() * 0.5 + 0.5,
        text: memoryTexts[Math.floor(Math.random() * memoryTexts.length)],
        color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
      }

      bubblesRef.current.push(newBubble)
    }

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update bubbles
      bubblesRef.current = bubblesRef.current
        .map((bubble) => {
          // Update position
          bubble.y -= bubble.speed
          bubble.x += Math.sin(bubble.y * 0.01) * 0.5
          bubble.rotation += bubble.rotationSpeed

          // Fade in and out
          if (bubble.y > canvas.height - 100) {
            bubble.opacity = Math.min(bubble.opacity + 0.01, 0.8)
          } else if (bubble.y < 100) {
            bubble.opacity = Math.max(bubble.opacity - 0.01, 0)
          }

          return bubble
        })
        .filter((bubble) => bubble.y > -bubble.size && bubble.opacity > 0)

      // Draw bubbles
      bubblesRef.current.forEach((bubble) => {
        ctx.save()

        // Translate to bubble center for rotation
        ctx.translate(bubble.x, bubble.y)
        ctx.rotate(bubble.rotation)

        // Draw bubble
        ctx.beginPath()
        ctx.arc(0, 0, bubble.size, 0, Math.PI * 2)
        ctx.fillStyle = bubble.color.replace(/[\d.]+\)$/, `${bubble.opacity})`)
        ctx.fill()

        // Draw text
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity + 0.2})`
        ctx.font = `${bubble.size / 5}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(bubble.text, 0, 0)

        ctx.restore()
      })

      // Randomly create new bubbles
      if (Math.random() < 0.02 && bubblesRef.current.length < 15) {
        createBubble()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      cancelAnimationFrame(animationRef.current)
    }
  }, []) // Empty dependency array to run only once

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }} />
}
