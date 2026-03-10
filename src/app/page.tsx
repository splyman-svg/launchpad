'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MousePointer2, Activity, Play, CheckCircle2, Sparkles } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const mainRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={mainRef} className="relative min-h-screen selection:bg-accent/30 selection:text-dark">
      {/* SVG Noise Overlay Filter */}
      <svg className="hidden">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={4} stitchTiles="stitch" />
        </filter>
      </svg>
      <div className="noise-overlay" style={{ filter: 'url(#noise)' }}></div>

      {/* A. NAVBAR */}
      <Navbar />

      <main className="w-full pb-20">
        {/* B. HERO */}
        <Hero />

        {/* C. FEATURES */}
        <Features />

        {/* D. PHILOSOPHY */}
        <Philosophy />

        {/* E. PROTOCOL - How It Works */}
        <Protocol />

        {/* F. PRICING */}
        <Pricing />
      </main>

      {/* G. FOOTER */}
      <Footer />
    </div>
  )
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out w-[90%] max-w-5xl rounded-[2rem] px-8 py-4 flex items-center justify-between ${scrolled ? 'glass-panel text-primary border-primary/20' : 'bg-transparent text-background drop-shadow-md'}`}>
      <div className="font-sans font-bold text-2xl tracking-tighter cursor-pointer">HustlUp</div>
      <nav className="hidden md:flex gap-8 items-center font-sans font-semibold text-sm tracking-wide">
        <a href="#how-it-works" className="hover:text-accent transition-colors">See how it works</a>
        <a href="#pricing" className="hover:text-accent transition-colors">Pricing</a>
        <Link href="/login" className="hover:text-accent transition-colors">Log in</Link>
      </nav>
      <Link href="/interview" className="bg-accent hover:bg-dark text-background px-6 py-2.5 rounded-full font-sans font-semibold text-sm shadow-md transition-colors btn">
        <span className="relative z-10">Find My Side Hustle</span>
        <span className="hover-layer bg-dark"></span>
      </Link>
    </header>
  )
}

function Hero() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      tl.to('.hero-text', {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.2
      })
        .to('.hero-cta', {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out'
        }, '-=0.6')
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative h-[100dvh] w-full flex items-end pb-24 px-6 md:px-16 overflow-hidden bg-dark">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.jpg"
          alt="Tropical sunset with palm trees"
          className="w-full h-full object-cover opacity-50 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-dark/40"></div>
      </div>

      <div className="relative z-10 max-w-5xl flex flex-col gap-6 w-full lg:w-2/3">
        <h1 className="flex flex-col gap-1 text-background" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
          <span className="hero-text translate-y-10 opacity-0 font-sans font-bold text-5xl md:text-6xl lg:text-7xl tracking-tighter">
            Potential is the
          </span>
          <span className="hero-text translate-y-10 opacity-0 font-drama text-7xl md:text-8xl lg:text-[8rem] leading-[0.85] text-accent mt-2 pr-4 md:pr-0 origin-left" style={{ textShadow: '0 2px 25px rgba(0,0,0,0.6)' }}>
            Blueprint.
          </span>
        </h1>

        <p className="hero-text translate-y-10 opacity-0 text-background font-sans text-xl md:text-2xl max-w-2xl leading-relaxed mt-4 font-light" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.4)' }}>
          Find your perfect side hustle in 10 minutes with an AI-powered interview and personalized 30-day roadmap.
        </p>

        <div className="hero-cta translate-y-4 opacity-0 flex flex-col sm:flex-row gap-4 mt-8">
          <Link href="/interview" className="bg-accent px-8 py-4 rounded-full font-sans font-bold text-background text-lg shadow-lg hover:shadow-accent/20 btn flex items-center justify-center gap-2">
            <span className="relative z-10">Find My Side Hustle</span>
            <span className="hover-layer bg-white/10"></span>
          </Link>
          <a href="#how-it-works" className="flex items-center justify-center gap-2 px-8 py-4 font-sans font-medium text-background/80 hover:text-background transition-colors group">
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform text-accent" />
            <span>See how it works</span>
          </a>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.feature-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%'
          }
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-32 px-6 md:px-16 max-w-7xl mx-auto w-full" id="features">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <DiagnosticShuffler />
        <TelemetryTypewriter />
        <CursorProtocolScheduler />
      </div>
    </section>
  )
}

function DiagnosticShuffler() {
  const [cards, setCards] = useState([
    { id: 1, label: 'Analyzing skillset', status: 'In Progress', value: 'Copywriting, Basic HTML' },
    { id: 2, label: 'Scanning schedule', status: 'Pending', value: '12 hours/week available' },
    { id: 3, label: 'Evaluating goals', status: 'Pending', value: '$500/mo target' }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const newCards = [...prev]
        const top = newCards.pop()
        if (top) newCards.unshift(top)
        return newCards
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="feature-card glass-panel rounded-[2rem] p-8 flex flex-col h-[400px] border border-primary/10 shadow-xl bg-background">
      <div className="mb-auto">
        <h3 className="font-sans font-bold text-2xl text-dark mb-2">10-Minute AI Interview</h3>
        <p className="font-sans text-primary/70">Real analysis of your specific situation.</p>
      </div>

      <div className="relative h-48 w-full" style={{ perspective: '1000px' }}>
        {cards.map((card, i) => {
          const isTop = i === 0
          const zIndex = 10 - i
          const scale = 1 - (i * 0.05)
          const yOffset = i * 20

          return (
            <div
              key={card.id}
              className={`absolute top-0 left-0 w-full p-4 rounded-xl border transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isTop ? 'bg-primary text-background border-primary/20 shadow-lg' : 'bg-background text-dark border-primary/10 hidden md:block'}`}
              style={{
                transform: `translateY(${yOffset}px) scale(${scale})`,
                zIndex,
                opacity: 1 - (i * 0.2)
              }}
            >
              <div className="flex justify-between items-center mb-2 font-mono text-xs opacity-70">
                <span>{card.status}</span>
                <Activity className="w-3 h-3" />
              </div>
              <div className="font-sans font-semibold mb-1">{card.label}</div>
              <div className="font-mono text-xs opacity-60 truncate">{card.value}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TelemetryTypewriter() {
  const [text, setText] = useState('')
  const fullText = '> Analyzing inputs...\n> Correlating market data...\n> Match found: Freelance Newsletter Writer\n> Success probability: 87%\n> Ready to begin.'

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setText(fullText.substring(0, i))
      i++
      if (i > fullText.length) {
        clearInterval(interval)
      }
    }, 40)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="feature-card rounded-[2rem] p-8 flex flex-col h-[400px] border border-primary/10 shadow-xl bg-dark text-background relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-background/10">
          <div>
            <h3 className="font-sans font-bold text-2xl mb-1">Instant Match</h3>
            <p className="font-sans text-background/80 text-sm">Highest chance of success.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <span className="font-mono text-xs text-accent">LIVE FEED</span>
          </div>
        </div>

        <div className="font-mono text-sm leading-relaxed text-background/90 whitespace-pre-wrap flex-grow">
          {text}
          <span className="inline-block w-2 h-4 bg-accent ml-1 animate-pulse align-middle"></span>
        </div>
      </div>
    </div>
  )
}

function CursorProtocolScheduler() {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 })

      tl.to('.anim-cursor', {
        x: 140,
        y: 40,
        duration: 1,
        ease: 'power2.inOut'
      })
        .to('.anim-cursor', {
          scale: 0.8,
          duration: 0.1
        })
        .to('.cell-3', {
          backgroundColor: '#CC5833',
          color: '#F2F0E9',
          duration: 0.2
        }, '<')
        .to('.anim-cursor', {
          scale: 1,
          duration: 0.1
        })
        .to('.anim-cursor', {
          x: 180,
          y: 120,
          duration: 0.8,
          ease: 'power2.inOut',
          delay: 0.2
        })
        .to('.anim-cursor', {
          scale: 0.8,
          duration: 0.1
        })
        .to('.save-btn', {
          scale: 0.95,
          duration: 0.1
        }, '<')
        .to(['.anim-cursor', '.save-btn'], {
          scale: 1,
          duration: 0.1
        })
        .to('.anim-cursor', {
          opacity: 0,
          duration: 0.2
        })
        .set('.anim-cursor', { x: 0, y: 0 })
        .set('.cell-3', { backgroundColor: 'transparent', color: 'inherit' })
        .to('.anim-cursor', {
          opacity: 1,
          duration: 0.2,
          delay: 0.5
        })
    }, gridRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="feature-card glass-panel rounded-[2rem] p-8 flex flex-col h-[400px] border border-primary/10 shadow-xl bg-background">
      <div className="mb-auto">
        <h3 className="font-sans font-bold text-2xl text-dark mb-2">30-Day Action Plan</h3>
        <p className="font-sans text-primary/70">Step-by-step roadmap tailored to you.</p>
      </div>

      <div ref={gridRef} className="relative mt-auto border border-primary/10 rounded-xl p-4 bg-white/50">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {days.map((day, i) => (
            <div key={i} className={`flex items-center justify-center w-8 h-8 rounded-lg font-mono text-sm border border-primary/5 cell-${i} text-dark/40`}>
              {day}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center border-t border-primary/5 pt-4">
          <div className="flex items-center gap-2 text-xs font-sans text-primary/60">
            <CheckCircle2 className="w-4 h-4 text-accent" /> Milestone generated
          </div>
          <button className="save-btn bg-dark text-background text-xs px-3 py-1.5 rounded-md font-sans">
            Add to Plan
          </button>
        </div>

        {/* Animated Cursor */}
        <MousePointer2
          className="anim-cursor absolute top-0 left-0 w-6 h-6 text-accent drop-shadow-md z-20 pointer-events-none"
          style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }}
          fill="currentColor"
          stroke="white"
          strokeWidth={2}
        />
      </div>
    </div>
  )
}

function Philosophy() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.philosophy-line-1',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          }
        }
      )
      gsap.fromTo('.philosophy-line-2',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 50%',
          }
        }
      )
      gsap.to('.philosophy-bg', {
        y: '15%',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden bg-dark text-background py-32" id="philosophy">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=2574&auto=format&fit=crop"
          alt="Organic texture"
          className="philosophy-bg absolute w-full h-[120%] object-cover opacity-10 -top-[10%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 w-full text-center flex flex-col items-center">
        <p className="philosophy-line-1 font-sans text-xl md:text-2xl text-background/60 mb-8 max-w-2xl font-light tracking-wide">
          Most platforms focus on endless scrolling and generic advice.
        </p>
        <h2 className="philosophy-line-2 font-sans font-bold text-5xl md:text-6xl lg:text-7xl leading-tight">
          <span className="block mb-2">We focus on</span>
          <span className="font-drama italic text-7xl md:text-8xl lg:text-9xl text-accent pr-4">precision execution.</span>
        </h2>
      </div>
    </section>
  )
}

function Protocol() {
  const containerRef = useRef<HTMLElement>(null)
  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const card3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=4000',
          pin: true,
          scrub: 1,
        }
      })

      // 0→1: Card 1 visible (dwell)
      // 1→2: Card 1 fades, Card 2 slides in
      tl.to(card1Ref.current, { scale: 0.9, opacity: 0.3, filter: 'blur(10px)', duration: 1 }, 1)
        .fromTo(card2Ref.current, { y: '100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 1 }, 1)

      // 2→3: Card 2 visible (dwell)
      // 3→4: Card 2 fades, Card 3 slides in
      tl.to(card1Ref.current, { scale: 0.85, opacity: 0, filter: 'blur(15px)', duration: 1 }, 3)
        .to(card2Ref.current, { scale: 0.9, opacity: 0.3, filter: 'blur(10px)', duration: 1 }, 3)
        .fromTo(card3Ref.current, { y: '100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 1 }, 3)

      // 4→5: Card 3 visible (dwell before unpin)
      tl.to({}, { duration: 1 }, 4)

      gsap.to('.motif-rotate', {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none'
      })

      gsap.to('.scanner-line', {
        y: '100%',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      })

      gsap.to('.waveform-path', {
        strokeDashoffset: 0,
        duration: 3,
        repeat: -1,
        ease: 'none'
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-background overflow-hidden" id="how-it-works">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#2E4036 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.05 }}></div>

      {/* Card 1: The Interview */}
      <div ref={card1Ref} className="absolute inset-0 flex items-center justify-center p-6 md:p-16 z-10 w-full max-w-7xl mx-auto h-full origin-top">
        <div className="glass-panel w-full h-[80vh] rounded-2xl md:rounded-[3rem] p-6 md:p-12 flex flex-col md:flex-row items-center justify-between border-primary/20 bg-background shadow-2xl relative overflow-hidden">
          <div className="w-full md:w-1/2 flex flex-col justify-center z-10">
            <div className="font-mono text-lg md:text-xl text-primary/60 mb-3 md:mb-4">01</div>
            <h2 className="font-sans font-bold text-4xl md:text-6xl text-dark mb-4 md:mb-6">The Interview</h2>
            <p className="font-sans text-lg md:text-xl text-dark/70 max-w-md leading-relaxed">
              We don&apos;t do generic quizzes. Our AI conducts a deep, 10-minute analysis of your unique skills, schedule constraints, and personal goals.
            </p>
          </div>
          <div className="hidden md:flex w-full md:w-1/2 h-full items-center justify-center relative mt-8 md:mt-0 z-0">
            <div className="relative w-[300px] h-[300px] opacity-80">
              <div className="motif-rotate absolute inset-0 border-[1px] border-primary/30 rounded-full w-full h-full border-dashed"></div>
              <div className="motif-rotate absolute top-10 left-10 border-[2px] border-accent/40 rounded-full w-[220px] h-[220px]" style={{ animationDirection: 'reverse', animationDuration: '15s' }}></div>
              <div className="motif-rotate absolute top-20 left-20 border-[1px] border-primary/50 rounded-full w-[140px] h-[140px]"></div>
              <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: The Match */}
      <div ref={card2Ref} className="absolute inset-0 flex items-center justify-center p-6 md:p-16 z-20 w-full max-w-7xl mx-auto h-full origin-top" style={{ transform: 'translateY(100%)' }}>
        <div className="w-full h-[80vh] rounded-2xl md:rounded-[3rem] p-6 md:p-12 flex flex-col md:flex-row items-center justify-between border border-primary/20 bg-primary shadow-2xl relative overflow-hidden text-background">
          <div className="absolute inset-0 opacity-10 object-cover mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop')", backgroundSize: 'cover' }}></div>
          <div className="w-full md:w-1/2 flex flex-col justify-center relative z-10 md:order-1 mt-8 md:mt-0">
            <div className="font-mono text-lg md:text-xl text-background/60 mb-3 md:mb-4">02</div>
            <h2 className="font-sans font-bold text-4xl md:text-6xl mb-4 md:mb-6">The Match</h2>
            <p className="font-sans text-lg md:text-xl text-background/80 max-w-md leading-relaxed">
              Your profile is correlated against our database of viable income models. We present the single side hustle with your highest probability of success.
            </p>
          </div>
          <div className="hidden md:flex w-full md:w-1/2 h-full items-center justify-center relative z-10 md:order-2">
            <div className="relative w-[80%] h-[180px] md:h-[300px] border border-background/20 rounded-xl overflow-hidden bg-dark/50 backdrop-blur-md">
              <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(242, 240, 233, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(242, 240, 233, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <div className="scanner-line absolute top-0 left-0 w-full h-[2px] bg-accent shadow-[0_0_15px_3px_#CC5833]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/10 backdrop-blur-xl px-6 py-3 rounded-full border border-background/20 font-mono text-sm shadow-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                Match: Confirmed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: The Plan */}
      <div ref={card3Ref} className="absolute inset-0 flex items-center justify-center p-6 md:p-16 z-30 w-full max-w-7xl mx-auto h-full" style={{ transform: 'translateY(100%)' }}>
        <div className="glass-panel w-full h-[80vh] rounded-2xl md:rounded-[3rem] p-6 md:p-12 flex flex-col md:flex-row items-center justify-between border-accent/30 bg-background shadow-2xl relative overflow-hidden">
          <div className="w-full md:w-1/2 flex flex-col justify-center relative z-10">
            <div className="font-mono text-lg md:text-xl text-accent mb-3 md:mb-4">03</div>
            <h2 className="font-sans font-bold text-4xl md:text-6xl text-dark mb-4 md:mb-6">The Plan</h2>
            <p className="font-sans text-lg md:text-xl text-dark/70 max-w-md leading-relaxed mb-6 md:mb-8">
              Leave ambiguity behind. You receive a structured 30-day action plan with specific income targets, milestones, and curated resources to begin execution immediately.
            </p>
            <Link href="/interview" className="w-fit bg-primary hover:bg-dark text-background px-8 py-4 rounded-full font-sans font-semibold shadow-lg transition-colors btn">
              <span className="relative z-10">Start Your Interview</span>
              <span className="hover-layer bg-accent"></span>
            </Link>
          </div>
          <div className="hidden md:flex w-full md:w-1/2 h-full items-center justify-center relative z-10">
            <div className="relative w-full max-w-[400px]">
              <svg viewBox="0 0 400 150" className="w-full drop-shadow-[0_0_8px_rgba(204,88,51,0.5)]">
                <path
                  className="waveform-path"
                  d="M 0,75 L 50,75 L 75,25 L 125,125 L 175,25 L 225,125 L 275,25 L 300,75 L 400,75"
                  fill="none"
                  stroke="#CC5833"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                />
              </svg>
              <div className="mt-8 flex justify-between font-mono text-xs text-primary/60 px-4">
                <span>Day 01</span>
                <span>Target: $500</span>
                <span>Day 30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.pricing-card',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.2,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          }
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-32 px-6 md:px-16 max-w-5xl mx-auto w-full" id="pricing">
      <div className="text-center mb-16">
        <p className="font-mono text-sm text-accent uppercase tracking-widest mb-4">Pricing</p>
        <h2 className="font-sans font-bold text-4xl md:text-5xl text-dark">Start free. Upgrade when ready.</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Tier */}
        <div className="pricing-card glass-panel rounded-[2rem] p-8 border border-primary/10 flex flex-col">
          <h3 className="font-sans font-bold text-xl text-dark mb-2">Free Roadmap</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="font-sans font-bold text-4xl text-dark">$0</span>
            <span className="text-xs text-primary/40 font-sans ml-1">forever</span>
          </div>
          <p className="font-sans text-dark/60 text-sm mb-6">Everything you need to find your perfect side hustle.</p>
          <ul className="flex flex-col gap-3 mb-8 flex-grow">
            {['10-minute AI interview', 'Personalized hustle match', 'Full 30-day action plan', '90-day income target', 'Top 3 curated resources'].map((item) => (
              <li key={item} className="flex items-start gap-3 font-sans text-dark/70 text-sm">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/interview" className="w-full bg-primary/10 hover:bg-primary/20 text-primary px-6 py-3.5 rounded-full font-sans font-semibold text-center transition-colors text-sm">
            Get My Free Roadmap
          </Link>
        </div>

        {/* Pro Tier */}
        <div className="pricing-card bg-dark rounded-[2rem] p-8 text-background flex flex-col relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-accent text-background text-[10px] font-mono font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> POPULAR
          </div>
          <h3 className="font-sans font-bold text-xl mb-2">Pro Coach</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="font-sans font-bold text-4xl">$29</span>
            <span className="text-background/50 text-lg font-sans">/mo</span>
          </div>
          <p className="font-sans text-background/60 text-sm mb-6">Your AI coach walks you through the plan — every single day.</p>
          <ul className="flex flex-col gap-3 mb-8 flex-grow">
            {['Everything in Free', 'Deep-dive onboarding session', 'AI coach that knows your hustle', 'Daily tasks broken down for you', 'Progress tracking & streaks', 'Daily motivation emails', 'Mood check-ins & adaptive support'].map((item) => (
              <li key={item} className="flex items-start gap-3 text-background/80 text-sm font-sans">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/upgrade" className="w-full bg-accent hover:bg-background hover:text-dark text-background px-6 py-3.5 rounded-full font-sans font-bold text-center transition-all text-sm">
            Go Pro &mdash; $29/mo
          </Link>
          <p className="text-center text-background/30 text-xs font-sans mt-3">Cancel anytime. No commitment.</p>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-dark text-background rounded-t-[4rem] px-12 py-20 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <h2 className="text-3xl font-sans font-bold tracking-tight mb-4">HustlUp</h2>
          <p className="text-background/60 text-lg max-w-sm mb-8 font-sans">
            Find your perfect side hustle in 10 minutes with an AI-powered interview.
          </p>
          <div className="flex items-center gap-3 bg-white/5 py-2 px-4 rounded-full w-fit border border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-background/80">System Operational</span>
          </div>
        </div>

        <div>
          <h4 className="font-sans font-semibold text-sm tracking-widest uppercase mb-6 text-background/50">Navigation</h4>
          <div className="flex flex-col gap-4 font-sans">
            <a href="#" className="hover:text-accent transition-colors w-fit">Home</a>
            <a href="#how-it-works" className="hover:text-accent transition-colors w-fit">How It Works</a>
            <a href="#pricing" className="hover:text-accent transition-colors w-fit">Pricing</a>
            <Link href="/interview" className="hover:text-accent transition-colors w-fit text-accent">Find My Hustle &rarr;</Link>
          </div>
        </div>

        <div>
          <h4 className="font-sans font-semibold text-sm tracking-widest uppercase mb-6 text-background/50">Legal</h4>
          <div className="flex flex-col gap-4 font-sans text-background/80">
            <a href="#" className="hover:text-background transition-colors w-fit">Privacy Policy</a>
            <a href="#" className="hover:text-background transition-colors w-fit">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
