import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-subtle  -z-10 " />
      
      <div className="container mx-auto px-4 ">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">CV Builder & ATS Optimizer</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Create Your Perfect CV in{" "}
            <span className="bg-gradient-to-r from-[hsl(221_83%_53%)] to-[hsl(217_91%_60%)] bg-clip-text text-transparent font-semibold">
  Minutes
</span>

          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stand out from the crowd with QuickCV. Build ATS-friendly CVs that get you noticed by recruiters. 
            Perfect for fresh graduates starting their career journey.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/cv-builder">
              <Button size="lg" className="group">
                Create Free CV
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
             
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-border">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">100%</div>
              <div className="text-sm text-muted-foreground">ATS Compatible</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">50K+</div>
              <div className="text-sm text-muted-foreground">CVs Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">5 Min</div>
              <div className="text-sm text-muted-foreground">Average Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
