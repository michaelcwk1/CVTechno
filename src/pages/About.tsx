import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Target, Users, Rocket } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About QuickCV</h1>
              <p className="text-lg text-muted-foreground">
                Empowering fresh graduates to land their dream jobs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center shadow-card">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Our Mission</h3>
                  <p className="text-sm text-muted-foreground">
                    Make professional CV creation accessible to everyone, especially fresh graduates
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-card">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Who We Serve</h3>
                  <p className="text-sm text-muted-foreground">
                    Fresh graduates and job seekers looking to create their first professional CV
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-card">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Our Vision</h3>
                  <p className="text-sm text-muted-foreground">
                    To be the go-to platform for CV creation with AI-powered optimization
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-12 shadow-card">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Why QuickCV?</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We understand the challenges fresh graduates face when creating their first CV. 
                    Without prior experience, it can be overwhelming to know where to start.
                  </p>
                  <p>
                    QuickCV was built to solve this problem. Our platform combines simplicity with 
                    professional design, ensuring your CV passes Applicant Tracking Systems (ATS) 
                    while still looking great to human recruiters.
                  </p>
                  <p>
                    With our AI-powered suggestions and optimized templates, you can create a 
                    professional CV in just minutes, not hours.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card id="contact" className="shadow-card">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p className="text-muted-foreground mb-6">
                  Have questions or need support? We're here to help!
                </p>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <a 
                    href="mailto:support@quickcv.com" 
                    className="text-primary hover:underline"
                  >
                    support@quickcv.com
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
