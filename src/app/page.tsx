"use client"

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: any
    player: any
  }
}

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Play, Pause, Volume2, VolumeX, Loader2, Music, X, ExternalLink } from "lucide-react"

export default function DreamersLeagueStory() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { scrollYProgress } = useScroll({ target: containerRef })

  // Music player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showMusicControl, setShowMusicControl] = useState(true)
  const [playerReady, setPlayerReady] = useState(false)
  const [playerLoading, setPlayerLoading] = useState(true)
  const [playerError, setPlayerError] = useState(false)
  const [showMusicRecommendation, setShowMusicRecommendation] = useState(true)

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const y1 = useTransform(smoothProgress, [0, 1], [0, -200])
  const y2 = useTransform(smoothProgress, [0, 1], [0, -400])
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [1, 0.8, 0.8, 0])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      setMousePosition({
        x: (clientX / innerWidth - 0.5) * 100,
        y: (clientY / innerHeight - 0.5) * 100,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
      initializePlayer()
      return
    }

    // Load YouTube IFrame API
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // YouTube API ready callback
    window.onYouTubeIframeAPIReady = () => {
      initializePlayer()
    }

    return () => {
      if (window.player && typeof window.player.destroy === "function") {
        try {
          window.player.destroy()
        } catch (error) {
          console.log("Player cleanup error:", error)
        }
      }
    }
  }, [])

  const initializePlayer = () => {
    try {
      window.player = new window.YT.Player("youtube-player", {
        height: "0",
        width: "0",
        videoId: "b9HpOAYjY9I",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            console.log("YouTube player ready")
            setPlayerReady(true)
            setPlayerLoading(false)
            setPlayerError(false)
            try {
              event.target.setVolume(25) // Set to 25% volume for background music
            } catch (error) {
              console.log("Volume setting error:", error)
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false)
            } else if (event.data === window.YT.PlayerState.ENDED) {
              // Loop the music
              try {
                event.target.playVideo()
              } catch (error) {
                console.log("Replay error:", error)
              }
            }
          },
          onError: (event) => {
            console.log("YouTube player error:", event.data)
            setPlayerLoading(false)
            setPlayerReady(false)
            setPlayerError(true)

            // Handle specific YouTube errors
            switch (event.data) {
              case 2:
                console.log("Invalid video ID")
                break
              case 5:
                console.log("HTML5 player error")
                break
              case 100:
                console.log("Video not found or private")
                break
              case 101:
              case 150:
                console.log("Video cannot be embedded")
                break
              default:
                console.log("Unknown error")
            }
          },
        },
      })
    } catch (error) {
      console.log("Player initialization error:", error)
      setPlayerLoading(false)
      setPlayerReady(false)
      setPlayerError(true)
    }
  }

  const toggleMusic = () => {
    if (!playerReady || !window.player) {
      console.log("Player not ready yet")
      return
    }

    try {
      if (isPlaying) {
        window.player.pauseVideo()
      } else {
        window.player.playVideo()
      }
    } catch (error) {
      console.log("Toggle music error:", error)
    }
  }

  const toggleMute = () => {
    if (!playerReady || !window.player) {
      console.log("Player not ready yet")
      return
    }

    try {
      if (isMuted) {
        window.player.unMute()
        setIsMuted(false)
      } else {
        window.player.mute()
        setIsMuted(true)
      }
    } catch (error) {
      console.log("Toggle mute error:", error)
    }
  }

  const openYouTubeDirectly = () => {
    window.open("https://www.youtube.com/watch?v=b9HpOAYjY9I", "_blank")
  }

  const startMusicExperience = () => {
    setShowMusicRecommendation(false)
    if (playerReady && !playerError) {
      toggleMusic()
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden YouTube Player */}
      <div id="youtube-player" style={{ display: "none" }}></div>

      {/* Music Recommendation Modal */}
      <AnimatePresence>
        {showMusicRecommendation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-neutral-200"
            >
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-600 rounded-full flex items-center justify-center mx-auto"
                >
                  <Music className="w-8 h-8 text-white" />
                </motion.div>

                <div>
                  <h3 className="text-2xl font-light mb-2 text-neutral-900">Enhance Your Experience</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    We recommend playing background music while reading this story for an immersive experience.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={startMusicExperience}
                    disabled={playerLoading}
                    className="w-full bg-neutral-900 text-white py-3 px-6 rounded-lg hover:bg-neutral-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {playerLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading Music...</span>
                      </>
                    ) : playerError ? (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        <span>Open Music in YouTube</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Start with Music</span>
                      </>
                    )}
                  </button>

                  {playerError && (
                    <button
                      onClick={openYouTubeDirectly}
                      className="w-full border border-neutral-300 text-neutral-700 py-3 px-6 rounded-lg hover:bg-neutral-50 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Play on YouTube</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowMusicRecommendation(false)}
                    className="w-full text-neutral-500 py-2 hover:text-neutral-700 transition-colors"
                  >
                    Continue without music
                  </button>
                </div>

                {playerError && (
                  <div className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg">
                    <p>
                      This video has embedding restrictions. You can still enjoy the music by opening it in YouTube.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="fixed top-8 left-8 z-40 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-neutral-200/50"
      >
        <Image src="/images/logo.jpg" alt="Dreamskrin Logo" width={40} height={40} className="rounded-full" />
      </motion.div>

      {/* Floating Music Control */}
      {showMusicControl && !showMusicRecommendation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 1 }}
          className="fixed top-8 right-8 z-40 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg border border-neutral-200/50"
        >
          <div className="flex items-center space-x-3">
            {!playerError ? (
              <>
                <button
                  onClick={toggleMusic}
                  disabled={!playerReady || playerLoading}
                  className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={isPlaying ? "Pause music" : "Play music"}
                >
                  {playerLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={16} />
                  ) : (
                    <Play size={16} />
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  disabled={!playerReady || playerLoading}
                  className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </>
            ) : (
              <button
                onClick={openYouTubeDirectly}
                className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors"
                aria-label="Open music in YouTube"
              >
                <ExternalLink size={16} />
              </button>
            )}

            <button
              onClick={() => setShowMusicControl(false)}
              className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center hover:bg-neutral-200 transition-colors text-xs"
              aria-label="Hide music control"
            >
              <X size={12} />
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="text-xs text-neutral-500 mt-2 text-center font-mono"
          >
            {playerLoading
              ? "Loading..."
              : playerError
                ? "Click for YouTube"
                : playerReady
                  ? "Background Music"
                  : "Music Unavailable"}
          </motion.div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* AI-Generated Neural Network Background */}
        <div className="absolute inset-0">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src="/images/ai-hero-bg.png"
              alt="AI Neural Network Background"
              fill
              className="object-cover opacity-30"
              priority
            />
          </motion.div>

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40" />

          {/* Interactive mouse movement effect */}
          <motion.div
            style={{
              x: mousePosition.x * 0.02,
              y: mousePosition.y * 0.02,
            }}
            className="absolute inset-0 opacity-[0.15]"
          >
            <Image
              src="/images/ai-hero-bg.png"
              alt="AI Neural Network Background Layer"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            style={{ y: y1, opacity }}
            className="text-center"
          >
            {/* Main Title */}
            <div className="mb-16">
              <motion.h1
                className="text-[clamp(4rem,12vw,12rem)] font-light leading-[0.85] tracking-[-0.02em] mb-8 bg-gradient-to-b from-neutral-900 to-neutral-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                You made it.
              </motion.h1>

              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                className="h-px bg-gradient-to-r from-transparent via-neutral-400 to-transparent max-w-md mx-auto mb-8"
              />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
                className="text-xl md:text-2xl text-neutral-600 font-light tracking-wide"
              >
                The Dreamers League – AI Product Sprint
              </motion.p>
            </div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 2, ease: "easeOut" }}
              className="max-w-2xl mx-auto space-y-4"
            >
              <p className="text-lg text-neutral-500 leading-relaxed">
                June 25 – July 31 · 37 Days of Deep-Tech Product Development
              </p>
              <p className="text-base text-neutral-400 leading-relaxed">
                One unified team · Shared ownership · Outcome-driven development
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="w-px h-16 bg-gradient-to-b from-transparent via-neutral-400 to-transparent"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="w-2 h-2 bg-neutral-400 rounded-full mx-auto mt-2"
          />
        </motion.div>
      </section>

      {/* Selection Section */}
      <section className="min-h-screen flex items-center px-8 relative">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Visual Element */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative"
              >
                <div className="aspect-square relative">
                  {/* Background visualization */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div
                      className="w-full h-full opacity-20"
                      style={{
                        background: "radial-gradient(circle, #f8f8f8, #e8e8e8, #d8d8d8)",
                      }}
                    />
                  </div>

                  {/* Data Visualization SVG */}
                  <svg viewBox="0 0 400 400" className="w-full h-full relative z-10">
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Background circles */}
                    {[1, 2, 3, 4].map((i) => (
                      <motion.circle
                        key={i}
                        cx="200"
                        cy="200"
                        r={i * 40}
                        fill="none"
                        stroke="#e5e5e5"
                        strokeWidth="1"
                        filter="url(#glow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, delay: i * 0.2 }}
                        viewport={{ once: true }}
                      />
                    ))}

                    {/* Data points */}
                    <motion.circle
                      cx="200"
                      cy="80"
                      r="4"
                      fill="#000"
                      filter="url(#glow)"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 1 }}
                      viewport={{ once: true }}
                    />
                    <motion.circle
                      cx="320"
                      cy="200"
                      r="3"
                      fill="#666"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                      viewport={{ once: true }}
                    />
                    <motion.circle
                      cx="80"
                      cy="280"
                      r="2"
                      fill="#999"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.4 }}
                      viewport={{ once: true }}
                    />

                    {/* Center point with pulse effect */}
                    <motion.circle
                      cx="200"
                      cy="200"
                      r="8"
                      fill="#000"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.8, delay: 1.6 }}
                      viewport={{ once: true }}
                    />
                    <motion.circle
                      cx="200"
                      cy="200"
                      r="8"
                      fill="none"
                      stroke="#000"
                      strokeWidth="1"
                      animate={{ r: [8, 16, 8], opacity: [1, 0, 1] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                    />
                  </svg>

                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2 }}
                    viewport={{ once: true }}
                    className="absolute bottom-4 left-4 text-xs text-neutral-500 font-mono bg-white/80 backdrop-blur-sm px-2 py-1 rounded"
                  >
                    Selection Rate: 0.1%
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Content */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true, margin: "-100px" }}
                className="space-y-8"
              >
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-light leading-tight tracking-[-0.02em]">
                  Build and deploy a
                  <br />
                  production-aligned
                  <br />
                  <span className="text-neutral-400 relative">
                    AI product.
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      viewport={{ once: true }}
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-neutral-300 to-neutral-500 origin-left"
                    />
                  </span>
                </h2>

                <div className="space-y-6 max-w-xl">
                  <p className="text-xl text-neutral-600 leading-relaxed">
                    Over 37 days, collaboratively solve a concrete D2C problem — from ideation to a live system.
                  </p>
                  <p className="text-lg text-neutral-500 leading-relaxed">
                    This isn't a hackathon. It's a deep-tech product bootcamp where you build intelligently, iterate
                    boldly, and ship deliberately.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Movement Section */}
      <section className="min-h-screen flex items-center px-8 relative">
        <motion.div style={{ y: y2 }} className="absolute inset-0 opacity-[0.015]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #000 1px, transparent 1px),
                               radial-gradient(circle at 75% 75%, #000 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </motion.div>

        {/* Floating AI Art Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          viewport={{ once: true }}
          className="absolute top-1/4 left-1/4 w-64 h-64 opacity-[0.05]"
        >
          <div
            className="w-full h-full rounded-full blur-2xl"
            style={{
              background: "conic-gradient(from 0deg, #f0f0f0, #e0e0e0, #d0d0d0, #f0f0f0)",
            }}
          />
        </motion.div>

        <div className="max-w-7xl mx-auto w-full text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-16"
          >
            <div>
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-light leading-tight tracking-[-0.02em] mb-12">
                Your stack is fluid.
                <br />
                Your role is dynamic.
              </h2>

              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "200px" }}
                transition={{ duration: 2, delay: 0.5 }}
                viewport={{ once: true }}
                className="h-px bg-gradient-to-r from-transparent via-neutral-400 to-transparent mx-auto mb-12"
              />

              <h3 className="text-4xl md:text-5xl font-light text-neutral-400 tracking-[-0.01em]">
                Your mission is fixed.
              </h3>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 1 }}
              viewport={{ once: true }}
              className="text-xl md:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed font-light"
            >
              Ship something valuable, explainable, and usable in the real world. Cultivate engineering ownership,
              experimentation, and end-to-end problem-solving skills.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="min-h-screen flex items-center px-8">
        <div className="max-w-6xl mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <blockquote className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight text-neutral-700 mb-16 tracking-[-0.01em]">
              "What's important is not which tool
              <br />
              you use, but how clearly and
              <br />
              <span className="text-neutral-900 relative">
                effectively you deliver value."
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 1.5, delay: 1 }}
                  viewport={{ once: true }}
                  className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-neutral-300 via-neutral-600 to-neutral-300 origin-left"
                />
              </span>
            </blockquote>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              viewport={{ once: true }}
              className="text-lg text-neutral-500"
            >
              Build intelligently, iterate boldly, ship deliberately.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Sprint Phases Section */}
      <section className="min-h-screen flex items-center px-8">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light mb-8 tracking-[-0.02em]">
              Sprint Phases
              <br />
              <span className="text-neutral-400">37 Days</span>
            </h2>
            <p className="text-xl text-neutral-600 font-light">
              Structured phases with specific expectations, tech focus, and collaboration rituals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Blueprint Mode",
                description:
                  "Problem discovery and system design. Map your pipeline clearly from input to output with technical architecture.",
                number: "01",
                dates: "June 25–27",
              },
              {
                title: "Get it Moving",
                description:
                  "First build — get data flowing end to end. Prove that a user can enter input and get meaningful output.",
                number: "02",
                dates: "June 30 – July 4",
              },
              {
                title: "Go Useful",
                description:
                  "Deliver real value and refine the core. Make it actually solve the user problem with 60-70% reliability.",
                number: "03",
                dates: "July 7–12",
              },
              {
                title: "Product Pulse",
                description:
                  "UX, evaluation, and external readiness. Live deployment with polished frontend and performance monitoring.",
                number: "04",
                dates: "July 15–21",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true, margin: "-50px" }}
                className="group"
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="p-8 border border-neutral-200 hover:border-neutral-300 transition-all duration-300 bg-white hover:shadow-xl hover:shadow-neutral-100/50 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-xs font-mono text-neutral-400 tracking-wider bg-neutral-100 px-2 py-1 rounded">
                      {item.number}
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "2rem" }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="h-px bg-gradient-to-r from-neutral-300 to-neutral-500 mt-2"
                    />
                  </div>

                  <h3 className="text-2xl md:text-3xl font-light mb-2 group-hover:text-neutral-800 transition-colors tracking-[-0.01em]">
                    {item.title}
                  </h3>

                  <p className="text-sm text-neutral-500 font-mono mb-4">{item.dates}</p>

                  <p className="text-neutral-600 leading-relaxed font-light">{item.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="min-h-screen flex items-center px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light leading-tight mb-8 tracking-[-0.02em]">
                One unified team.
                <br />
                Shared ownership.
                <br />
                <span className="text-neutral-400">Real impact.</span>
              </h2>

              <div className="space-y-6 max-w-xl">
                <p className="text-xl text-neutral-600 leading-relaxed font-light">
                  Your roles are flexible, but you need point-people: backend logic, LLM orchestration, UI/UX,
                  infrastructure, and evaluation.
                </p>
                <p className="text-lg text-neutral-500 leading-relaxed">
                  From GitHub to deployment, from ideation to Demo Day — you'll build something that matters together.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              <div className="aspect-square relative">
                {/* Orbital visualization */}
                <div className="absolute inset-0 border border-neutral-200 rounded-full shadow-inner"></div>
                <div className="absolute inset-4 border border-neutral-200 rounded-full opacity-60"></div>
                <div className="absolute inset-8 border border-neutral-200 rounded-full opacity-40"></div>
                <div className="absolute inset-12 border border-neutral-200 rounded-full opacity-20"></div>

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-4 left-1/2 w-3 h-3 bg-gradient-to-br from-neutral-400 to-neutral-600 rounded-full transform -translate-x-1/2 shadow-lg"></div>
                  <div className="absolute bottom-4 left-1/2 w-3 h-3 bg-gradient-to-br from-neutral-400 to-neutral-600 rounded-full transform -translate-x-1/2 shadow-lg"></div>
                  <div className="absolute left-4 top-1/2 w-3 h-3 bg-gradient-to-br from-neutral-400 to-neutral-600 rounded-full transform -translate-y-1/2 shadow-lg"></div>
                  <div className="absolute right-4 top-1/2 w-3 h-3 bg-gradient-to-br from-neutral-400 to-neutral-600 rounded-full transform -translate-y-1/2 shadow-lg"></div>
                </motion.div>

                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                  className="absolute top-1/2 left-1/2 w-6 h-6 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="min-h-screen flex items-center px-8">
        <div className="max-w-6xl mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="text-xs font-mono tracking-[0.3em] text-neutral-400 mb-16 bg-neutral-100 inline-block px-4 py-2 rounded-full">
              FROM THE FOUNDER
            </div>

            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-neutral-700 mb-16 max-w-5xl mx-auto tracking-[-0.01em]">
              "I started Dreamskrin with one belief: that young builders like you can
              <span className="text-neutral-900"> shape the future</span>, not just chase it.
              <br />
              <br />
              You've made it here because you're bold enough to build, and brave enough to care."
            </blockquote>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
              className="space-y-2"
            >
              <p className="text-sm font-mono tracking-wider text-neutral-600">HARSHAL MAHALE</p>
              <p className="text-xs text-neutral-500">Founder & CEO, Dreamskrin</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final Section */}
      <section className="min-h-screen flex items-center px-8 relative">
        {/* AI-Generated Final Art */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 3, delay: 0.5 }}
          viewport={{ once: true }}
          className="absolute top-1/2 right-1/4 w-80 h-80 opacity-[0.06]"
        >
          <div
            className="w-full h-full rounded-full blur-3xl"
            style={{
              background: "radial-gradient(ellipse at center, #f8f8f8, #e8e8e8, #d8d8d8)",
            }}
          />
        </motion.div>

        <div className="max-w-7xl mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-8"
          >
            <h2 className="text-[clamp(4rem,12vw,12rem)] font-light leading-[0.85] tracking-[-0.02em] mb-16 bg-gradient-to-b from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
              Ship something
              <br />
              <span className="text-neutral-400">valuable.</span>
            </h2>

            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "8rem" }}
              transition={{ duration: 2, delay: 1 }}
              viewport={{ once: true }}
              className="h-px bg-gradient-to-r from-transparent via-neutral-400 to-transparent mx-auto"
            />
            <p className="text-lg text-neutral-500">Where ideas become infrastructure.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-8 border-t border-neutral-200 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center text-xs text-neutral-500 font-mono mb-8">
            <div className="flex items-center space-x-4">
              <Image src="/images/logo.jpg" alt="Dream Skrin Logo" width={32} height={32} className="rounded-full" />
              <span>© 2024 Dreamskrin</span>
            </div>
            <div className="flex space-x-8">
              <button className="hover:text-neutral-700 transition-colors">Privacy</button>
              <button className="hover:text-neutral-700 transition-colors">Terms</button>
              <button className="hover:text-neutral-700 transition-colors">Contact</button>
            </div>
          </div>
          <div className="text-center">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 2 }}
              viewport={{ once: true }}
              className="h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent mx-auto"
            />
          </div>
        </div>
      </footer>
    </div>
  )
}
