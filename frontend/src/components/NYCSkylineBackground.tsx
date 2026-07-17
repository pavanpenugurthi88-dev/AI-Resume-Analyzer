import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'

export default function NYCSkylineBackground() {
  const { theme } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none transition-colors duration-700 bg-background">
      {/* Sky Ambient Glow / Morning Sun */}
      {isDark ? (
        // NYC Midnight Glow
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/10 blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-500/8 blur-[130px]" />
          <div className="absolute top-[30%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/5 blur-[100px]" />
        </div>
      ) : (
        // NYC Morning Sky Gradient
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/70 via-sky-50/40 to-white">
          <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-amber-200/20 blur-[90px] animate-pulse-slow" />
          <div className="absolute top-[10%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-100/30 blur-[100px]" />
        </div>
      )}

      {/* Grid Overlay */}
      {isDark && (
        <div 
          className="absolute inset-0 opacity-[0.03] transition-opacity duration-700" 
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(59,130,246,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.2) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      )}

      {/* Moving Clouds (Light Mode) */}
      {!isDark && (
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <motion.div
            initial={{ x: '-10%' }}
            animate={{ x: '110%' }}
            transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[10%] w-[250px] h-[60px] bg-white/80 blur-xl rounded-full"
          />
          <motion.div
            initial={{ x: '110%' }}
            animate={{ x: '-10%' }}
            transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[22%] w-[350px] h-[80px] bg-white/70 blur-2xl rounded-full"
          />
        </div>
      )}

      {/* Stars (Dark Mode) */}
      {isDark && (
        <div className="absolute top-0 left-0 right-0 h-[60vh] opacity-60">
          {[...Array(24)].map((_, i) => {
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 90;
            const randomDelay = Math.random() * 5;
            const randomDuration = 2 + Math.random() * 4;
            const size = Math.random() * 2 + 1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0.1 }}
                animate={{ opacity: [0.1, 0.9, 0.1] }}
                transition={{
                  duration: randomDuration,
                  delay: randomDelay,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute bg-white rounded-full shadow-[0_0_8px_#ffffff]"
                style={{
                  top: `${randomY}%`,
                  left: `${randomX}%`,
                  width: `${size}px`,
                  height: `${size}px`
                }}
              />
            );
          })}
        </div>
      )}

      {/* Subtle Fog/Mist Overlay */}
      <div className={`absolute bottom-0 left-0 right-0 h-[25vh] z-[5] ${isDark ? 'bg-gradient-to-t from-[#050816] to-transparent opacity-65' : 'bg-gradient-to-t from-white to-transparent opacity-80'}`} />

      {/* NYC Skyline Silhouettes (SVG Layers) */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[320px] md:h-[400px] flex items-end overflow-hidden select-none">
        
        {/* Layer 1: Distant Skyline */}
        <svg 
          viewBox="0 0 1440 400" 
          className={`absolute bottom-0 w-full h-full object-cover transition-colors duration-700 ${isDark ? 'text-slate-900/30' : 'text-slate-200/40'}`}
          preserveAspectRatio="none"
        >
          {/* Skyline outline path */}
          <path 
            fill="currentColor" 
            d="M0,400 L0,300 L60,300 L60,320 L100,320 L100,240 L120,240 L120,220 L140,220 L140,240 L160,240 L160,350 L200,350 L200,280 L230,280 L230,250 L250,250 L250,280 L290,280 L290,340 L340,340 L340,180 L355,180 L355,100 L360,100 L360,180 L375,180 L375,340 L420,340 L420,260 L460,260 L460,230 L490,230 L490,260 L520,260 L520,320 L580,320 L580,210 L600,210 L600,190 L610,190 L610,210 L630,210 L630,320 L680,320 L680,290 L710,290 L710,350 L770,350 L770,160 L790,160 L790,130 L795,130 L795,80 L800,80 L800,130 L805,130 L805,160 L825,160 L825,350 L880,350 L880,270 L920,270 L920,250 L950,250 L950,270 L980,270 L980,330 L1040,330 L1040,200 L1060,200 L1060,150 L1065,150 L1065,90 L1070,90 L1070,150 L1075,150 L1075,200 L1095,200 L1095,330 L1150,330 L1150,280 L1200,280 L1200,340 L1260,340 L1260,220 L1280,220 L1280,200 L1295,200 L1295,220 L1310,220 L1310,340 L1380,340 L1380,290 L1440,290 L1440,400 Z"
          />
        </svg>

        {/* Layer 2: Mid-ground Towers with Windows */}
        <div className="absolute bottom-0 w-full h-[85%] z-10">
          <svg 
            viewBox="0 0 1440 340" 
            className={`w-full h-full object-cover transition-colors duration-700 ${isDark ? 'text-slate-900/60' : 'text-slate-300/50'}`}
            preserveAspectRatio="none"
          >
            <path 
              fill="currentColor" 
              d="M0,340 L0,220 L40,220 L40,240 L80,240 L80,180 L110,180 L110,150 L125,150 L125,180 L150,180 L150,270 L210,270 L210,210 L250,210 L250,270 L300,270 L300,120 L315,120 L315,50 L320,50 L320,120 L335,120 L335,270 L390,270 L390,200 L430,200 L430,170 L460,170 L460,200 L490,200 L490,270 L550,270 L550,160 L575,160 L575,270 L630,270 L630,230 L670,230 L670,270 L720,270 L720,100 L735,100 L735,30 L740,30 L740,100 L755,100 L755,270 L810,270 L810,180 L850,180 L850,150 L875,150 L875,180 L900,180 L900,270 L960,270 L960,220 L1000,220 L1000,270 L1060,270 L1060,140 L1075,140 L1075,60 L1080,60 L1080,140 L1095,140 L1095,270 L1160,270 L1160,200 L1200,200 L1200,270 L1260,270 L1260,150 L1290,150 L1290,270 L1360,270 L1360,210 L1410,210 L1410,340 Z"
            />
          </svg>

          {/* Glowing Windows (Flickering / Pulsing only in Dark Mode) */}
          {isDark && (
            <div className="absolute inset-0">
              {/* Building 1 (at 300px) */}
              <div className="absolute left-[21.5%] bottom-[25%] grid grid-cols-2 gap-1.5 opacity-60">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 0.9, 0.2] }}
                    transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.4 }}
                    className="w-1 h-1.5 bg-yellow-300 rounded-[1px] shadow-[0_0_2px_#fde047]"
                  />
                ))}
              </div>

              {/* Building 2 (at 720px - ESB Spire Spoke) */}
              <div className="absolute left-[50.8%] bottom-[35%] grid grid-cols-3 gap-1 opacity-70">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 0.9, 0.3] }}
                    transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
                    className="w-[3px] h-[5px] bg-cyan-300 rounded-[1px] shadow-[0_0_2px_#06b6d4]"
                  />
                ))}
              </div>

              {/* Spire Light Beacon */}
              <motion.div 
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute left-[51.25%] bottom-[91%] w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"
              />

              {/* Building 3 (at 1060px) */}
              <div className="absolute left-[74.6%] bottom-[30%] grid grid-cols-2 gap-1.5 opacity-55">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.1, 0.8, 0.1] }}
                    transition={{ duration: 2.5 + (i % 2), repeat: Infinity, delay: i * 0.5 }}
                    className="w-1.5 h-2 bg-amber-300 rounded-[1px] shadow-[0_0_2px_#f59e0b]"
                  />
                ))}
              </div>
              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute left-[74.9%] bottom-[82%] w-1 h-1 bg-red-400 rounded-full shadow-[0_0_6px_#f87171]"
              />
            </div>
          )}
        </div>

        {/* Layer 3: Foreground detailed silhouette */}
        <div className="absolute bottom-0 w-full h-[65%] z-20">
          <svg 
            viewBox="0 0 1440 260" 
            className={`w-full h-full object-cover transition-colors duration-700 ${isDark ? 'text-[#0a122c]' : 'text-slate-300/80'}`}
            preserveAspectRatio="none"
          >
            <path 
              fill="currentColor" 
              d="M0,260 L0,180 L50,180 L50,200 L90,200 L90,140 L140,140 L140,210 L190,210 L190,160 L240,160 L240,210 L310,210 L310,90 L345,90 L345,210 L410,210 L410,150 L470,150 L470,210 L520,210 L520,130 L550,130 L550,100 L565,100 L565,210 L620,210 L620,170 L680,170 L680,210 L760,210 L760,60 L790,60 L790,210 L840,210 L840,140 L890,140 L890,210 L940,210 L940,120 L980,120 L980,210 L1050,210 L1050,150 L1100,150 L1100,210 L1170,210 L1170,80 L1205,80 L1205,210 L1270,210 L1270,140 L1320,140 L1320,210 L1380,210 L1380,170 L1440,170 L1440,260 Z"
            />
          </svg>

          {/* Glowing Windows - Foreground detailed lights */}
          {isDark ? (
            <div className="absolute inset-0">
              {/* Building 1 - Left side (at 90px) */}
              <div className="absolute left-[6.8%] bottom-[30%] grid grid-cols-3 gap-1 opacity-80">
                {[...Array(9)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.8 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
                    className="w-[3px] h-2 bg-yellow-100 rounded-[1px] shadow-[0_0_3px_rgba(253,224,71,0.8)]"
                  />
                ))}
              </div>

              {/* Building 2 - Middle Left (at 310px) */}
              <div className="absolute left-[22.2%] bottom-[20%] grid grid-cols-2 gap-2 opacity-85">
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3.5 + (i % 4), repeat: Infinity, delay: i * 0.15 }}
                    className="w-1.5 h-2.5 bg-sky-200 rounded-[1px] shadow-[0_0_4px_rgba(14,165,233,0.7)]"
                  />
                ))}
              </div>

              {/* Building 3 - Center Tower (at 760px) */}
              <div className="absolute left-[53.5%] bottom-[25%] grid grid-cols-3 gap-1.5 opacity-90">
                {[...Array(18)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-3 bg-yellow-200 rounded-[1px] shadow-[0_0_3px_rgba(234,179,8,0.7)]"
                  />
                ))}
              </div>
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute left-[54.3%] bottom-[77.5%] w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"
              />

              {/* Building 4 - Right Center (at 1170px) */}
              <div className="absolute left-[81.8%] bottom-[22%] grid grid-cols-2 gap-2 opacity-80">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 3.2 + (i % 2), repeat: Infinity, delay: i * 0.3 }}
                    className="w-[5px] h-3 bg-cyan-200 rounded-[1px] shadow-[0_0_4px_rgba(6,182,212,0.6)]"
                  />
                ))}
              </div>
              <motion.div 
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                className="absolute left-[82.6%] bottom-[69.5%] w-1 h-1 bg-red-500 rounded-full shadow-[0_0_6px_#ef4444]"
              />
            </div>
          ) : (
            // Light mode skyline highlights (sun reflections)
            <div className="absolute inset-0">
              {/* Highlight left edges of foreground buildings to simulate morning sun coming from top-right */}
              <div className="absolute left-[21.5%] bottom-[5%] w-[2px] h-[55%] bg-white/60 blur-[1px]" />
              <div className="absolute left-[52.8%] bottom-[5%] w-[2px] h-[75%] bg-white/70 blur-[1px]" />
              <div className="absolute left-[81.2%] bottom-[5%] w-[2px] h-[65%] bg-white/50 blur-[1px]" />
            </div>
          )}
        </div>
      </div>

      {/* Floating Light Particles (Dark Mode) */}
      {isDark && (
        <div className="absolute inset-0 z-[6] opacity-40">
          {[...Array(15)].map((_, i) => {
            const randomX = Math.random() * 100;
            const randomDelay = Math.random() * 8;
            const randomDuration = 10 + Math.random() * 12;
            const size = Math.random() * 3 + 2;
            return (
              <motion.div
                key={i}
                initial={{ y: '105vh', x: `${randomX}vw`, opacity: 0.1 }}
                animate={{ 
                  y: '-5vh',
                  x: [`${randomX}vw`, `${randomX + (Math.random() * 10 - 5)}vw`, `${randomX}vw`],
                  opacity: [0.1, 0.8, 0.1]
                }}
                transition={{
                  duration: randomDuration,
                  delay: randomDelay,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="absolute bg-gradient-to-t from-blue-400 to-cyan-400 rounded-full blur-[0.5px]"
                style={{
                  width: `${size}px`,
                  height: `${size}px`
                }}
              />
            );
          })}
        </div>
      )}

      {/* Luxury Street Lamp Glows (Subtle warm spots on street level, dark mode) */}
      {isDark && (
        <div className="absolute bottom-[2%] left-0 right-0 h-[20px] flex justify-around opacity-30 z-30">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-[80px] h-[80px] bg-amber-500/20 rounded-full blur-xl" />
          ))}
        </div>
      )}
    </div>
  )
}
