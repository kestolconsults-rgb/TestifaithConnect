import { Link } from "wouter";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A safe, uplifting space for believers to share and read testimonies of God's goodness, 
              growing faith through the experiences of others.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/testimonies" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-testimonies">
                  All Testimonies
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-categories">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link href="/post" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-share">
                  Share Your Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Mission */}
          <div>
            <h3 className="font-semibold mb-4">Our Mission</h3>
            <p className="text-sm text-muted-foreground italic font-serif leading-relaxed">
              "Therefore encourage one another and build each other up, just as in fact you are doing."
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              — 1 Thessalonians 5:11
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Testifaith. Built with faith and love.
          </p>
        </div>
      </div>
    </footer>
  );
}
