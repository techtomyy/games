import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { User, Zap, Crown, Sparkles } from "lucide-react";

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);
      toast({
        title: "Success!",
        description: "You've been logged in successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    try {
      await signup(email, password, firstName, lastName);
      toast({
        title: "Success!",
        description: "Account created! Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoType: 'free' | 'pro') => {
    setIsLoading(true);
    
    try {
      if (demoType === 'free') {
        await login('demo@drawplay.com', 'demo123');
        toast({
          title: "Demo Login Success!",
          description: "Welcome to the free demo! You can create up to 3 games.",
        });
      } else {
        await login('pro@drawplay.com', 'pro123');
        toast({
          title: "Pro Demo Login Success!",
          description: "Welcome to the pro demo! Unlimited game creation unlocked.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to login with demo account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-heading">
          Welcome to DrawPlayUniverse
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Demo Login Buttons */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">Quick Demo Access</h3>
            <p className="text-sm text-muted-foreground">Try the app instantly with demo accounts</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleDemoLogin('free')}
              disabled={isLoading}
              className="btn-coral"
              variant="outline"
            >
              <User className="mr-2" size={16} />
              Free Demo
            </Button>
            <Button
              onClick={() => handleDemoLogin('pro')}
              disabled={isLoading}
              className="btn-turquoise"
              variant="outline"
            >
              <Crown className="mr-2" size={16} />
              Pro Demo
            </Button>
          </div>
          
          <div className="mt-3 text-center">
            <div className="text-xs text-muted-foreground space-y-1">
              <div><strong>Free Demo:</strong> demo@drawplay.com / demo123</div>
              <div><strong>Pro Demo:</strong> pro@drawplay.com / pro123</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                />
              </div>
              <Button type="submit" className="w-full btn-coral" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  placeholder="Create a password"
                />
              </div>
              <Button type="submit" className="w-full btn-turquoise" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
