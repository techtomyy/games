import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User, Zap, Crown, Sparkles } from "lucide-react";

interface AuthFormProps {
  onSuccess?: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const { login, signup, isAuthenticated, resendConfirmation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Handle redirect when user becomes authenticated
  useEffect(() => {
    console.log('Auth form useEffect - isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to /home');
      // Small delay to ensure state is fully updated
      const timer = setTimeout(() => {
        onSuccess?.();
        setLocation("/home");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, onSuccess, setLocation]);


  const handleResendConfirmation = async (email: string) => {
    try {
      await resendConfirmation(email);
      toast({
        title: "Confirmation Email Sent!",
        description: "Please check your inbox and spam folder for the confirmation email.",
      });
    } catch (error: any) {
      const errorMessage = error.message?.includes(':') 
        ? error.message.split(': ')[1] 
        : error.message || "Failed to resend confirmation email.";
      
      toast({
        title: "Failed to Resend",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await login(email, password);
      toast({
        title: "Success!",
        description: response.message || "You've been logged in successfully.",
      });
      // Redirect will be handled by useEffect when isAuthenticated becomes true
    } catch (error: any) {
      // Extract error message from the error
      const errorMessage = error.message?.includes(':') 
        ? error.message.split(': ')[1] 
        : error.message || "Failed to log in. Please try again.";
      
      // Check if it's an email confirmation error
      const isEmailConfirmationError = errorMessage.toLowerCase().includes('email not confirmed') || 
                                      errorMessage.toLowerCase().includes('confirm your email');
      
      if (isEmailConfirmationError) {
        setPendingEmail(email);
        toast({
          title: "Email Confirmation Required",
          description: errorMessage,
          variant: "destructive",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResendConfirmation(email)}
              className="ml-2"
            >
              Resend Email
            </Button>
          ),
        });
      } else {
        // Check if it's a genuine authentication failure (invalid credentials)
        const isInvalidCredentials = errorMessage.toLowerCase().includes('invalid email') || 
                                   errorMessage.toLowerCase().includes('invalid password') ||
                                   errorMessage.toLowerCase().includes('invalid credentials') ||
                                   errorMessage.toLowerCase().includes('authentication failed');
        
        const displayMessage = isInvalidCredentials ? "Invalid email and password" : errorMessage;
        
        toast({
          title: "Login Failed",
          description: displayMessage,
          variant: "destructive",
        });
      }
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
      const response = await signup(email, password, firstName, lastName);

      // Safety: if backend ever returns success with a duplicate-email phrasing, handle it here
      const msg = (response?.message || '').toLowerCase();
      const looksLikeDuplicate =
        msg.includes('already registered') ||
        msg.includes('email already') ||
        msg.includes('already exists') ||
        msg.includes('duplicate') ||
        msg.includes('unique constraint') ||
        msg.includes('user already');

      if (looksLikeDuplicate) {
        toast({
          title: "Signup Failed",
          description: "Account already exists on this email",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account Created!",
        description: "Please check your email to confirm your account before logging in.",
      });
      // Switch to login tab after successful signup
      setActiveTab("login");
    } catch (error: any) {
      // Extract error message from the error
      const errorMessage = error.message?.includes(':') 
        ? error.message.split(': ')[1] 
        : error.message || "Failed to create account. Please try again.";
      // Friendlier message when email already exists
      const lower = (errorMessage || '').toLowerCase();
      const isExistingAccount =
        lower.includes('already registered') ||
        lower.includes('email already') ||
        lower.includes('already exists') ||
        lower.includes('duplicate') ||
        lower.includes('unique constraint') ||
        lower.includes('user already');

      const displayMessage = isExistingAccount
        ? 'Account already exists on this email'
        : errorMessage;

      toast({
        title: "Signup Failed",
        description: displayMessage,
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
      // Redirect will be handled by useEffect when isAuthenticated becomes true
    } catch (error: any) {
      // If demo accounts don't exist, show helpful message
      const errorMessage = error.message?.includes(':') 
        ? error.message.split(': ')[1] 
        : error.message || "Demo accounts not available. Please create your own account.";
      
      // Check if it's a genuine authentication failure (invalid credentials)
      const isInvalidCredentials = errorMessage.toLowerCase().includes('invalid email') || 
                                 errorMessage.toLowerCase().includes('invalid password') ||
                                 errorMessage.toLowerCase().includes('invalid credentials') ||
                                 errorMessage.toLowerCase().includes('authentication failed');
      
      const displayMessage = isInvalidCredentials 
        ? "Invalid email and password. You can create your own account using the signup form."
        : errorMessage + " You can create your own account using the signup form.";
      
      toast({
        title: "Demo Login Failed",
        description: displayMessage,
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
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
