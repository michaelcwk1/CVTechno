import { CheckCircle, Zap, Shield, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: CheckCircle,
    title: "Pass ATS Filters",
    description: "Our CV format is optimized to pass Applicant Tracking Systems, ensuring your application reaches human recruiters.",
  },
  {
    icon: Zap,
    title: "Quick & Easy",
    description: "Create a professional CV in just 5 minutes. No design skills needed - we handle everything for you.",
  },
  {
    icon: Shield,
    title: "Perfect for Fresh Graduates",
    description: "Specially designed templates that highlight your education, skills, and potential - even without extensive work experience.",
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Stop struggling with Word templates. Our smart forms guide you through every section of your CV.",
  },
];

const Benefits = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose QuickCV?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create a professional CV that gets you hired
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="border-2 hover:border-primary transition-all duration-300 hover:shadow-card group"
            >
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <benefit.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
