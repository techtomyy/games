import { Palette, Twitter, Instagram, Youtube, Music } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <Palette className="text-primary text-lg" />
              </div>
              <span className="font-heading text-xl">Draw & Play</span>
            </div>
            <p className="text-primary-foreground/80 mb-6">
              Turn your creativity into playable games with the power of AI. Join thousands of creators worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-coral rounded-lg flex items-center justify-center hover:scale-110 transition-transform" data-testid="link-twitter">
                <Twitter className="text-white" size={16} />
              </a>
              <a href="#" className="w-10 h-10 bg-coral rounded-lg flex items-center justify-center hover:scale-110 transition-transform" data-testid="link-instagram">
                <Instagram className="text-white" size={16} />
              </a>
              <a href="#" className="w-10 h-10 bg-coral rounded-lg flex items-center justify-center hover:scale-110 transition-transform" data-testid="link-youtube">
                <Youtube className="text-white" size={16} />
              </a>
              <a href="#" className="w-10 h-10 bg-coral rounded-lg flex items-center justify-center hover:scale-110 transition-transform" data-testid="link-tiktok">
                <Music className="text-white" size={16} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Product</h4>
            <ul className="space-y-3 text-primary-foreground/80">
              <li><a href="#features" className="hover:text-coral transition-colors" data-testid="link-features">Features</a></li>
              <li><a href="#games" className="hover:text-coral transition-colors" data-testid="link-game-types">Game Types</a></li>
              <li><a href="#" className="hover:text-coral transition-colors" data-testid="link-ai-tech">AI Technology</a></li>
              <li><a href="#pricing" className="hover:text-coral transition-colors" data-testid="link-pricing">Pricing</a></li>
              <li><a href="#" className="hover:text-coral transition-colors" data-testid="link-roadmap">Roadmap</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Community</h4>
            <ul className="space-y-3 text-primary-foreground/80">
              <li><a href="#gallery" className="hover:text-coral transition-colors" data-testid="link-gallery">Gallery</a></li>
              <li><a href="#" className="hover:text-coral transition-colors" data-testid="link-competitions">Competitions</a></li>
              <li><a href="#" className="hover:text-coral transition-colors" data-testid="link-discord">Discord</a></li>
              <li><a href="#" className="hover:text-coral transition-colors" data-testid="link-forums">Forums</a></li>
              <li><a href="#" className="hover:text-coral transition-colors" data-testid="link-spotlight">Creator Spotlight</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Support</h4>
            <ul className="space-y-3 text-primary-foreground/80">
              <li><a href="#" className="hover:text-coral transition-colors" data-testid="link-help">Help Center</a></li>
              <li><a href="#" className="hover:text-coral transition-colors" data-testid="link-tutorials">Tutorials</a></li>
              <li><a href="#" className="hover:text-coral transition-colors" data-testid="link-contact">Contact Us</a></li>
              <li><a href="#" className="hover:text-coral transition-colors" data-testid="link-schools">Schools Program</a></li>
              <li><a href="#" className="hover:text-coral transition-colors" data-testid="link-api">API Docs</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-foreground/60 text-sm mb-4 md:mb-0" data-testid="text-copyright">
            © 2024 Draw & Play Universe. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-primary-foreground/60">
            <a href="#" className="hover:text-coral transition-colors" data-testid="link-privacy">Privacy Policy</a>
            <a href="#" className="hover:text-coral transition-colors" data-testid="link-terms">Terms of Service</a>
            <a href="#" className="hover:text-coral transition-colors" data-testid="link-cookies">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
