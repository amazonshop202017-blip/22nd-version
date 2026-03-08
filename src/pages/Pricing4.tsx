import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Pricing4Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.95)',
        borderBottom: '1px solid #EBEBEB',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/home-4" className="text-lg tracking-tight" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
            <span className="font-normal" style={{ color: '#0F0F0F' }}>Trade</span>
            <span className="font-bold" style={{ color: '#0F0F0F' }}>Valley</span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {['Home', 'Features', 'Pricing', 'How It Works'].map((label) => (
              <Link
                key={label}
                to={label === 'Home' ? '/home-4' : label === 'Pricing' ? '/pricing-4' : label === 'How It Works' ? '/home-4#how-it-works' : `/${label.toLowerCase()}`}
                className="text-sm transition-colors"
                style={{ color: label === 'Pricing' ? '#0F0F0F' : '#8A8A8A', fontFamily: "'DM Sans', 'Inter', sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.color = '#0F0F0F')}
                onMouseLeave={e => { if (label !== 'Pricing') e.currentTarget.style.color = '#8A8A8A'; }}
              >
                {label}
              </Link>
            ))}
          </div>

          <Link
            to="/entering"
            className="hidden md:inline-flex text-sm font-semibold px-5 py-2.5 transition-colors"
            style={{ background: '#0F0F0F', color: '#FFFFFF', borderRadius: 0 }}
          >
            Start Free — 14 Days
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Pricing4 = () => {
  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      <Pricing4Navbar />
    </div>
  );
};

export default Pricing4;
