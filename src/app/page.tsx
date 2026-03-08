import Link from 'next/link'

const benefits = [
  {
    icon: '🎯',
    title: 'Personalized to You',
    desc: 'Your roadmap is built from your skills, schedule, and goals — not a generic template.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Matching',
    desc: 'Claude AI analyzes your answers to find the side hustle with the highest chance of success for you.',
  },
  {
    icon: '🗺️',
    title: 'Actionable Roadmap',
    desc: 'Get a 30-day step-by-step plan, income targets, and hand-picked free resources to get started today.',
  },
]

const testimonials = [
  {
    quote: "I finally started my freelance writing gig after 2 years of 'thinking about it.' The roadmap made it concrete.",
    name: 'Mara T.',
    role: 'Nurse turned copywriter',
  },
  {
    quote: "My Etsy shop made $400 its first month. The niche recommendation was spot-on.",
    name: 'James K.',
    role: 'Software engineer with a side hustle',
  },
  {
    quote: "I quit scrolling job boards and built a tutoring business in 3 weeks. Best 10 minutes I've spent.",
    name: 'Priya S.',
    role: 'Teacher + online tutor',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            Launch<span className="text-green-600">Pad</span>
          </span>
          <Link
            href="/interview"
            className="text-sm font-medium text-green-700 hover:text-green-800"
          >
            Start free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full mb-6">
            🚀 Free · 10 minutes · No sign-up required
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Find Your Perfect Side Hustle{' '}
            <span className="text-green-600">in 10 Minutes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Answer 10 quick questions. Get an AI-generated roadmap tailored to your skills,
            schedule, and income goals — with your first 30 days mapped out step by step.
          </p>
          <Link
            href="/interview"
            className="inline-block bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-lg font-bold px-10 py-4 rounded-xl shadow-lg transition-colors"
          >
            Start My Free Assessment →
          </Link>
          <p className="mt-4 text-sm text-gray-400">No credit card needed for your preview</p>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Why LaunchPad works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-400 text-sm font-medium uppercase tracking-wider mb-10">
            Join 500+ people who found their side hustle
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="border border-gray-100 rounded-2xl p-6">
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                <p className="text-gray-400 text-xs">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-600 px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to find your side hustle?
          </h2>
          <p className="text-green-100 mb-8">
            Takes 10 minutes. Free preview included. Your personalized roadmap waits.
          </p>
          <Link
            href="/interview"
            className="inline-block bg-white text-green-700 font-bold text-lg px-10 py-4 rounded-xl shadow hover:bg-green-50 transition-colors"
          >
            Start My Free Assessment →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} LaunchPad. Built with AI.
      </footer>
    </main>
  )
}
