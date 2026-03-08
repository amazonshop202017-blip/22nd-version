import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';

const Landing2 = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <div className="pt-16 flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-display font-bold text-foreground">Home 2</h1>
          <p className="text-muted-foreground text-lg">Coming soon — this page is under construction.</p>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
};

export default Landing2;
