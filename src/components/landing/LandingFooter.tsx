import { Link } from 'react-router-dom';
import logo from '@/assets/logo.svg';

export const LandingFooter = () => {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="TradeValley" className="h-7 brightness-0 invert" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The premium trading journal built for traders who refuse to stay average.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link to="/features" className="text-sm text-slate-300 hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-sm text-slate-300 hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link to="/entering" className="text-sm text-slate-300 hover:text-white transition-colors">Get Started</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><span className="text-sm text-slate-500 cursor-default">Privacy Policy</span></li>
              <li><span className="text-sm text-slate-500 cursor-default">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} TradeValley. All rights reserved.</p>
          <p className="text-xs text-slate-500">Built for traders, by traders.</p>
        </div>
      </div>
    </footer>
  );
};
