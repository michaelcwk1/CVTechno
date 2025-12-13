import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 py-4">
        {/* Grid agar About bisa di tengah sempurna */}
        <div className="grid grid-cols-3 items-center">
          {/* Kiri: Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <FileText className="h-8 w-8 text-primary" />
              <span className="bg-gradient-to-r from-[hsl(221_83%_53%)] to-[hsl(217_91%_60%)] bg-clip-text text-transparent font-bold text-2xl">
                QuickCV
              </span>
            </Link>
          </div>

          {/* Tengah: Link About */}
          <div className="flex justify-center">
            <Link
              to="/about"
              className="text-foreground hover:text-primary transition-colors bg-gradient-to-r from-[hsl(221_83%_53%)] to-[hsl(217_91%_60%)] bg-clip-text text-transparent font-semibold text-2xl"
            >
              About
            </Link>
          </div>

          {/* Kanan: Tombol Login */}
          <div className="flex justify-end">
            <Link to="/cv-builder">
              <Button variant="default" className="font-bold">Create Your CV</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
