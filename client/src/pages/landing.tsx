import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import GameTypesGrid from "@/components/game-types-grid";
import { 
  Play, 
  Video, 
  Users, 
  Gamepad2, 
  Palette, 
  Wand2,
  Check,
  X,
  Heart,
  Star,
  Shield,
  Headphones
} from "lucide-react";

export default function Landing() {
  useEffect(() => {
    // Simple scroll animation for elements
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe animated elements
    const animatedElements = document.querySelectorAll('.fade-up');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-cream via-background to-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="font-heading text-4xl md:text-6xl text-primary mb-6 bounce-gentle" data-testid="hero-title">
                Draw It, Play It,<br />
                <span className="text-coral">Share It!</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed" data-testid="hero-description">
                Turn your drawings into amazing games instantly with AI. No coding needed - just draw, 
                and watch your characters come to life in platformers, racers, battle arenas, and more!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button 
                  className="btn-coral"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-start-drawing"
                >
                  <Play className="mr-2" />
                  Start Drawing Now
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  data-testid="button-watch-demo"
                >
                  <Video className="mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-6 text-muted-foreground">
                <div className="flex items-center" data-testid="stat-creators">
                  <Users className="text-turquoise mr-2" />
                  <span>50K+ Creators</span>
                </div>
                <div className="flex items-center" data-testid="stat-games">
                  <Gamepad2 className="text-orange mr-2" />
                  <span>100K+ Games</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  {/* Placeholder for hero image */}
                  <div className="rounded-xl w-full h-64 bg-gradient-to-br from-coral/20 to-turquoise/20 flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Palette className="w-16 h-16 text-coral mx-auto mb-4" />
                      <p className="text-muted-foreground">Creative Drawing Canvas</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <div className="w-12 h-12 bg-coral rounded-lg flex items-center justify-center">
                        <Palette className="text-white" />
                      </div>
                      <div className="w-12 h-12 bg-turquoise rounded-lg flex items-center justify-center">
                        <Wand2 className="text-white" />
                      </div>
                      <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center">
                        <Play className="text-white" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-heading text-primary" data-testid="steps-count">3 Steps</div>
                      <div className="text-muted-foreground">To Your Game</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-up">
            <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4" data-testid="features-title">
              Draw Anything, Play Everything
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered canvas turns your sketches into animated game characters with physics and behaviors
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="fade-up">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-coral rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Palette className="text-white text-2xl" />
                </div>
                <h3 className="font-heading text-xl text-primary mb-3">Smart Drawing Tools</h3>
                <p className="text-muted-foreground">
                  Professional drawing tools with AI-powered suggestions and automatic shape recognition
                </p>
              </CardContent>
            </Card>

            <Card className="fade-up">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-turquoise rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="text-white text-2xl" />
                </div>
                <h3 className="font-heading text-xl text-primary mb-3">AI Game Generation</h3>
                <p className="text-muted-foreground">
                  Advanced AI analyzes your drawings and creates custom games with physics and animations
                </p>
              </CardContent>
            </Card>

            <Card className="fade-up">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gold rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Play className="text-white text-2xl" />
                </div>
                <h3 className="font-heading text-xl text-primary mb-3">Instant Gameplay</h3>
                <p className="text-muted-foreground">
                  Play your games immediately or share them with friends and the community
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Game Types Section */}
      <section id="games" className="py-20 bg-gradient-to-br from-secondary to-cream">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-up">
            <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4" data-testid="game-types-title">
              Choose Your Game Adventure
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              One drawing, multiple game experiences. From platformers to racers, your art becomes playable magic
            </p>
          </div>

          <div className="fade-up">
            <GameTypesGrid 
              onSelectType={() => window.location.href = '/api/login'} 
            />
          </div>
        </div>
      </section>

      {/* Community Gallery */}
      <section id="gallery" className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-up">
            <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4" data-testid="gallery-title">
              Community Gallery
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what amazing games our creators have made from their drawings
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { title: "Dragon Quest", creator: "Emma, age 9", likes: 234, color: "coral" },
              { title: "Super Speedster", creator: "Alex, age 12", likes: 189, color: "turquoise" },
              { title: "Monster Battle", creator: "Sophia, age 10", likes: 312, color: "gold" },
              { title: "Robot Rescue", creator: "Michael, age 8", likes: 156, color: "orange" }
            ].map((game, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-br from-${game.color}/10 to-${game.color}/5 rounded-xl p-4 transform hover:scale-105 transition-transform fade-up`}
              >
                <div className={`w-full h-32 bg-${game.color}/20 rounded-lg mb-3 flex items-center justify-center`}>
                  <Gamepad2 className={`text-${game.color} text-3xl`} />
                </div>
                <h4 className="font-semibold text-foreground mb-1" data-testid={`game-title-${index}`}>
                  {game.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-2" data-testid={`game-creator-${index}`}>
                  By {game.creator}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <Heart className="text-coral" size={14} />
                    <span className="text-sm" data-testid={`game-likes-${index}`}>{game.likes}</span>
                  </div>
                  <Button size="sm" className="btn-turquoise text-xs px-3 py-1" data-testid={`button-play-${index}`}>
                    Play
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              className="btn-primary"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-view-all-games"
            >
              View All Community Games
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-background to-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-up">
            <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4" data-testid="pricing-title">
              Choose Your Creative Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade anytime to unlock more games, features, and sharing options
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="fade-up">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Palette className="text-muted-foreground text-2xl" />
                  </div>
                  <h3 className="font-heading text-2xl text-primary mb-2" data-testid="plan-free-title">Free Explorer</h3>
                  <div className="text-3xl font-bold text-foreground" data-testid="plan-free-price">
                    $0<span className="text-lg text-muted-foreground">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="text-turquoise mr-3" size={16} />
                    <span>3 games per month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-turquoise mr-3" size={16} />
                    <span>Basic drawing tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-turquoise mr-3" size={16} />
                    <span>1 game type (platformer)</span>
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <X className="mr-3" size={16} />
                    <span>HD game exports</span>
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <X className="mr-3" size={16} />
                    <span>Multiplayer games</span>
                  </li>
                </ul>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-start-free"
                >
                  Start Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="transform scale-105 border-2 border-coral relative fade-up">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-coral text-white px-6 py-2 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-coral rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Gamepad2 className="text-white text-2xl" />
                  </div>
                  <h3 className="font-heading text-2xl text-primary mb-2" data-testid="plan-pro-title">Pro Creator</h3>
                  <div className="text-3xl font-bold text-foreground" data-testid="plan-pro-price">
                    $9<span className="text-lg text-muted-foreground">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="text-turquoise mr-3" size={16} />
                    <span>Unlimited games</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-turquoise mr-3" size={16} />
                    <span>Advanced drawing tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-turquoise mr-3" size={16} />
                    <span>All 6 game types</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-turquoise mr-3" size={16} />
                    <span>HD game exports</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-turquoise mr-3" size={16} />
                    <span>Multiplayer games</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-turquoise mr-3" size={16} />
                    <span>Premium asset packs</span>
                  </li>
                </ul>

                <Button 
                  className="btn-coral w-full"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-start-pro"
                >
                  Start Pro Trial
                </Button>
              </CardContent>
            </Card>

            {/* School Plan */}
            <Card className="fade-up">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gold rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="text-white text-2xl" />
                  </div>
                  <h3 className="font-heading text-2xl text-primary mb-2" data-testid="plan-school-title">School Edition</h3>
                  <div className="text-3xl font-bold text-foreground" data-testid="plan-school-price">
                    $29<span className="text-lg text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Up to 30 students</p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="text-turquoise mr-3" size={16} />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-turquoise mr-3" size={16} />
                    <span>Classroom management</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-turquoise mr-3" size={16} />
                    <span>Student progress tracking</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-turquoise mr-3" size={16} />
                    <span>Lesson plan templates</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-turquoise mr-3" size={16} />
                    <span>Priority support</span>
                  </li>
                </ul>

                <Button 
                  className="btn-gold w-full"
                  data-testid="button-contact-sales"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12 fade-up">
            <p className="text-muted-foreground mb-4" data-testid="trial-info">
              All plans include 7-day free trial • No credit card required
            </p>
            <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Shield className="text-turquoise mr-2" size={16} />
                Secure & Safe
              </span>
              <span className="flex items-center">
                <Users className="text-turquoise mr-2" size={16} />
                Kid-Friendly
              </span>
              <span className="flex items-center">
                <Headphones className="text-turquoise mr-2" size={16} />
                24/7 Support
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}
