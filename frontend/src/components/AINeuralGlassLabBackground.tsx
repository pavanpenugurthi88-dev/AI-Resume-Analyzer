import { useEffect, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import Particles from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import type { Engine } from "@tsparticles/engine"
import { useThemeStore } from '../store/themeStore'

export default function AINeuralGlassLabBackground() {
  const { theme } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  // Motion values to feed the springs
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  // Spring-based smooth mouse parallax for different depth layers
  const mouseX1 = useSpring(rawX, { stiffness: 60, damping: 25 })
  const mouseY1 = useSpring(rawY, { stiffness: 60, damping: 25 })

  const mouseX2 = useSpring(rawX, { stiffness: 45, damping: 20 })
  const mouseY2 = useSpring(rawY, { stiffness: 45, damping: 20 })

  const mouseX3 = useSpring(rawX, { stiffness: 35, damping: 15 })
  const mouseY3 = useSpring(rawY, { stiffness: 35, damping: 15 })

  const mouseX4 = useSpring(rawX, { stiffness: 30, damping: 18 })
  const mouseY4 = useSpring(rawY, { stiffness: 30, damping: 18 })

  useEffect(() => {
    setMounted(true)

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const x = (clientX - window.innerWidth / 2) / 25
      const y = (clientY - window.innerHeight / 2) / 25
      rawX.set(x)
      rawY.set(y)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [rawX, rawY])

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none transition-colors duration-700 bg-background">
      
      {/* 3D Holographic Laboratory Lights & Orbs */}
      <div className="absolute inset-0 z-0">
        {/* Soft rotating blue-purple gradient background */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-tr from-primary/10 via-accent/5 to-transparent blur-[120px]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[90vw] h-[90vw] rounded-full bg-gradient-to-br from-primary-purple/5 via-accent/10 to-transparent blur-[140px]"
        />

        {/* Ambient Grid overlay representing laboratory workspace */}
        <div 
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]" 
          style={{
            backgroundImage: 'radial-gradient(var(--color-primary) 1.2px, transparent 1.2px)',
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      {/* Neural Network Particle System */}
      <Particles
        id="neural-network-particles"
        // @ts-ignore
        init={particlesInit}
        className="absolute inset-0 z-10 opacity-40 dark:opacity-60"
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: { enable: false },
              onHover: { enable: true, mode: "grab" },
              resize: { enable: true }
            },
            modes: {
              grab: {
                distance: 180,
                links: { opacity: 0.5 }
              }
            }
          },
          particles: {
            color: { value: isDark ? "#3B82F6" : "#2563EB" },
            links: {
              color: isDark ? "#06B6D4" : "#3B82F6",
              distance: 160,
              enable: true,
              opacity: 0.25,
              width: 1
            },
            move: {
              direction: "none",
              enable: true,
              outModes: { default: "bounce" },
              random: true,
              speed: 0.8,
              straight: false
            },
            number: {
              density: { enable: true },
              value: 65
            },
            opacity: { value: { min: 0.2, max: 0.6 } },
            shape: { type: "circle" },
            size: { value: { min: 1.5, max: 3.5 } }
          },
          detectRetina: true
        }}
      />

      {/* Floating 3D Elements with Parallax (Layered by mouse intensity) */}
      <div className="absolute inset-0 z-20 overflow-hidden">
        
        {/* Layer 1: Rotating Neural Network Ring / ATS Sphere */}
        <motion.div
          style={{ x: mouseX1, y: mouseY1 }}
          className="absolute right-[12%] top-[15%] w-[320px] h-[320px] rounded-full border border-primary/20 dark:border-accent/15 flex items-center justify-center backdrop-blur-xs shadow-glow-primary z-20"
        >
          {/* Inner rotating neon ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="w-[240px] h-[240px] rounded-full border-2 border-dashed border-accent/20 dark:border-primary-cyan/25 flex items-center justify-center"
          >
            {/* Core glowing sphere representing ATS score */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-[120px] h-[120px] rounded-full bg-gradient-to-tr from-primary/30 to-accent/40 dark:from-primary/40 dark:to-accent/50 blur-[20px] opacity-80"
            />
          </motion.div>

          {/* Little satellites rotating around the sphere */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute top-[10%] left-[10%] w-4 h-4 rounded-full bg-accent/30 dark:bg-accent/50 blur-[2px]" />
            <div className="absolute bottom-[20%] right-[15%] w-3 h-3 rounded-full bg-primary/40 dark:bg-primary/60 blur-[1px]" />
          </motion.div>
        </motion.div>

        {/* Layer 2: Floating 3D Resume Document */}
        <motion.div
          style={{
            x: mouseX2,
            y: mouseY2
          }}
          className="absolute left-[8%] top-[25%] w-[160px] h-[220px] rounded-[18px] bg-white/5 border border-white/10 dark:border-white/5 shadow-2xl backdrop-blur-md p-4 rotate-[-6deg] flex flex-col justify-between"
        >
          {/* Doc header */}
          <div className="space-y-2">
            <div className="w-1/2 h-2.5 rounded bg-primary/20 dark:bg-accent/30" />
            <div className="w-3/4 h-2 rounded bg-slate-300/10 dark:bg-white/10" />
          </div>
          {/* Doc body lines */}
          <div className="space-y-2.5 my-4">
            <div className="w-full h-1.5 rounded bg-slate-300/10 dark:bg-white/5" />
            <div className="w-5/6 h-1.5 rounded bg-slate-300/10 dark:bg-white/5" />
            <div className="w-11/12 h-1.5 rounded bg-slate-300/10 dark:bg-white/5" />
          </div>
          {/* Glowing bottom tag */}
          <div className="flex justify-between items-center">
            <div className="w-8 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="w-1/3 h-2 rounded bg-slate-300/10 dark:bg-white/10" />
          </div>

          {/* Holographic light reflections */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-[18px] pointer-events-none" />
        </motion.div>

        {/* Layer 3: Floating Skill Chips & Lab Panels */}
        <motion.div
          style={{
            x: mouseX3,
            y: mouseY3
          }}
          className="absolute left-[15%] bottom-[18%] space-y-4"
        >
          {/* Python Chip */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="px-4 py-2 rounded-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/5 shadow-lg backdrop-blur-md text-[11px] font-mono font-bold text-primary dark:text-accent tracking-wider flex items-center gap-1.5 w-fit"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> PYTHON
          </motion.div>

          {/* ATS Score Chip */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="px-4 py-2 rounded-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/5 shadow-lg backdrop-blur-md text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5 w-fit ml-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ATS MATCH
          </motion.div>
        </motion.div>

        <motion.div
          style={{
            x: mouseX4,
            y: mouseY4
          }}
          className="absolute right-[18%] bottom-[15%] space-y-4"
        >
          {/* React Chip */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="px-4 py-2 rounded-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/5 shadow-lg backdrop-blur-md text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1.5 w-fit"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> REACT
          </motion.div>

          {/* AI Chip */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="px-4 py-2 rounded-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/5 shadow-lg backdrop-blur-md text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 tracking-wider flex items-center gap-1.5 w-fit ml-[-20px]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> GEMINI AI
          </motion.div>
        </motion.div>

      </div>
    </div>
  )
}
