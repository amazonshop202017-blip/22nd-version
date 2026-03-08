import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';

const Landing4 = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <div className="pt-16 flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Home 4</h1>
          <p className="text-slate-500">Coming soon</p>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
};

export default Landing4;
