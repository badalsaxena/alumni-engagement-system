import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, MessageSquare, Shield, Zap, BookOpen, Trophy } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

const features = [
  { icon: Users, title: 'Department Matching', desc: 'Connect with alumni from your specific department for targeted mentorship.' },
  { icon: Shield, title: 'Verified Alumni', desc: 'Admin-gated verification ensures only genuine alumni join the platform.' },
  { icon: MessageSquare, title: 'Real-time Chat', desc: 'Direct messaging with your mentors for seamless communication.' },
  { icon: Zap, title: 'AI Smart Match', desc: 'AI-powered mentor recommendations based on your profile and goals.' },
  { icon: BookOpen, title: 'Knowledge Hub', desc: 'Career experiences, referrals, and internship opportunities shared by alumni.' },
  { icon: Trophy, title: 'Leaderboard', desc: 'Score-based system recognizing top mentors with premium features.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-heading text-xl font-semibold tracking-tight" data-testid="logo-link">
            Alumni<span className="text-white/50">Connect</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth/login" className="text-sm text-white/60 hover:text-white transition-colors" data-testid="nav-login-link">
              Sign In
            </Link>
            <Link to="/auth/signup" className="btn-primary text-sm" data-testid="nav-signup-link">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.07]"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1715534968149-8638313454ed?w=1600)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" className="space-y-8">
            <motion.p variants={fadeUp} custom={0} className="text-sm tracking-[0.3em] uppercase text-white/40 font-body">
              Invertis University Alumni Network
            </motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="font-heading text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight">
              Where Students Meet
              <br />
              <span className="font-semibold">Their Future</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto font-body font-light">
              Connect with verified alumni mentors from your department. Get career guidance, referrals, and real-world insights from those who've walked the path.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex items-center justify-center gap-4 pt-4">
              <Link to="/auth/signup" className="btn-primary inline-flex items-center gap-2 group" data-testid="hero-signup-btn">
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/auth/login" className="btn-secondary" data-testid="hero-login-btn">
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* Features */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm tracking-[0.2em] uppercase text-white/30 mb-4">Platform Features</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-light">
              Built for <span className="font-semibold">meaningful connections</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel-hover p-8"
                  data-testid={`feature-card-${i}`}
                >
                  <Icon className="w-6 h-6 text-white/60 mb-4" />
                  <h3 className="font-heading text-lg font-medium mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/40 font-body leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Departments', value: '6' },
            { label: 'AI Powered', value: 'GPT-4.o' },
            { label: 'Real-time Chat', value: 'Live' },
            { label: 'Verified Alumni', value: 'Admin-gated' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-heading text-2xl sm:text-3xl font-semibold">{stat.value}</p>
              <p className="text-sm text-white/30 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="font-heading text-3xl sm:text-4xl font-light">
            Ready to <span className="font-semibold">connect</span>?
          </h2>
          <p className="text-white/40 max-w-lg mx-auto">
            Join InvertisConnect today and start building meaningful mentorship relationships with verified alumni from your department.
          </p>
          <Link to="/auth/signup" className="btn-primary inline-flex items-center gap-2" data-testid="cta-signup-btn">
            Create Your Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-white/20">
          <span className="font-heading">AlumniConnect</span>
          <span>Made by Team Bug Off</span>
        </div>
      </footer>
    </div>
  );
}
