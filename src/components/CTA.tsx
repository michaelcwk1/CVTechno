import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 relative overflow-hidden ">
      <div className="absolute inset-0 bg-gradient-primary opacity-10 -z-10 " />
      
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of fresh graduates who've successfully created their CVs with QuickCV
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/cv-builder">
              <Button size="lg" className="group">
                Create Free CV Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
             
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
