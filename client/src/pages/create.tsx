import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import DrawingCanvas from "@/components/drawing-canvas";
import GamePreview from "@/components/game-preview";
import GameTypesGrid from "@/components/game-types-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Palette, 
  Wand2, 
  Play, 
  Save, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from "lucide-react";
import type { Drawing, Game } from "@shared/schema";

interface AnalysisResult {
  characterType: string;
  suggestedGameTypes: string[];
  animationFrames: number;
  physicsProperties: {
    mass: number;
    bounce: number;
    friction: number;
  };
  abilities: string[];
}

export default function Create() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1); // 1: Draw, 2: Analyze, 3: Choose Game Type, 4: Generate
  const [currentDrawing, setCurrentDrawing] = useState<string>('');
  const [savedDrawing, setSavedDrawing] = useState<Drawing | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<string>('');
  const [gameTitle, setGameTitle] = useState<string>('');
  const [generatedGame, setGeneratedGame] = useState<Game | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Save drawing mutation
  const saveDrawingMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await apiRequest("POST", "/api/drawings", {
        title: "New Drawing",
        imageData,
      });
      return response.json() as Promise<Drawing>;
    },
    onSuccess: (drawing) => {
      setSavedDrawing(drawing);
      toast({
        title: "Drawing Saved",
        description: "Your drawing has been saved successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save drawing. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Analyze drawing mutation
  const analyzeMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await apiRequest("POST", "/api/analyze-drawing", {
        imageData,
      });
      return response.json() as Promise<AnalysisResult>;
    },
    onSuccess: (analysisResult) => {
      setAnalysis(analysisResult);
      setStep(3);
      toast({
        title: "Analysis Complete!",
        description: `Detected a ${analysisResult.characterType}. Choose your game type!`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze your drawing. Please try a clearer drawing.",
        variant: "destructive",
      });
    },
  });

  // Generate game mutation
  const generateGameMutation = useMutation({
    mutationFn: async ({ drawingId, gameType, title }: { drawingId: string; gameType: string; title: string }) => {
      const response = await apiRequest("POST", "/api/generate-game", {
        drawingId,
        gameType,
        title,
      });
      return response.json() as Promise<Game>;
    },
    onSuccess: (game) => {
      setGeneratedGame(game);
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({
        title: "Game Generated!",
        description: "Your game is ready to play!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      if (error.message.includes("Monthly game limit reached")) {
        toast({
          title: "Limit Reached",
          description: "You've reached your monthly game limit. Upgrade to create more!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "Failed to generate your game. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleDrawingChange = (imageData: string) => {
    setCurrentDrawing(imageData);
  };

  const handleSaveAndAnalyze = async () => {
    if (!currentDrawing) {
      toast({
        title: "No Drawing",
        description: "Please draw something first!",
        variant: "destructive",
      });
      return;
    }

    // Save drawing first
    saveDrawingMutation.mutate(currentDrawing);
    
    // Then analyze it
    setStep(2);
    analyzeMutation.mutate(currentDrawing);
  };

  const handleGameTypeSelect = (gameType: string) => {
    setSelectedGameType(gameType);
    if (analysis) {
      setGameTitle(`${analysis.characterType} ${gameType}`);
    }
  };

  const handleGenerateGame = () => {
    if (!savedDrawing || !selectedGameType) {
      toast({
        title: "Missing Information",
        description: "Please complete all steps first.",
        variant: "destructive",
      });
      return;
    }

    setStep(4);
    generateGameMutation.mutate({
      drawingId: savedDrawing.id,
      gameType: selectedGameType,
      title: gameTitle || `My ${selectedGameType} Game`,
    });
  };

  const resetWorkflow = () => {
    setStep(1);
    setCurrentDrawing('');
    setSavedDrawing(null);
    setAnalysis(null);
    setSelectedGameType('');
    setGameTitle('');
    setGeneratedGame(null);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-4 pulse-animation">
            <Palette className="text-white" size={24} />
          </div>
          <p className="text-muted-foreground">Loading creation studio...</p>
        </div>
      </div>
    );
  }

  const subscription = user?.subscription;
  const isProUser = subscription?.plan === 'pro' || subscription?.plan === 'school';
  const gamesThisMonth = subscription?.gamesCreatedThisMonth || 0;
  const maxGames = subscription?.maxGamesPerMonth || 3;
  const canCreateMore = isProUser || gamesThisMonth < maxGames;

  if (!canCreateMore) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-orange mx-auto mb-4" />
              <h2 className="font-heading text-2xl text-primary mb-4">Monthly Limit Reached</h2>
              <p className="text-muted-foreground mb-6">
                You've created {gamesThisMonth} out of {maxGames} games this month. 
                Upgrade to Pro for unlimited game creation!
              </p>
              <Button className="btn-gold" data-testid="button-upgrade-limit">
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= stepNum 
                    ? stepNum === 1 ? 'bg-coral text-white' 
                      : stepNum === 2 ? 'bg-turquoise text-white'
                      : stepNum === 3 ? 'bg-gold text-white'
                      : 'bg-orange text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step > stepNum ? <CheckCircle size={20} /> : stepNum}
                </div>
                {stepNum < 4 && (
                  <ArrowRight className={`mx-2 ${step > stepNum ? 'text-primary' : 'text-muted-foreground'}`} size={16} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-4xl text-primary mb-2" data-testid="create-title">
            {step === 1 && "Draw Your Character"}
            {step === 2 && "Analyzing Your Drawing..."}
            {step === 3 && "Choose Your Game Type"}
            {step === 4 && "Generating Your Game..."}
          </h1>
          <p className="text-muted-foreground">
            {step === 1 && "Create your character and bring it to life!"}
            {step === 2 && "Our AI is analyzing your drawing to understand your character"}
            {step === 3 && "Pick the perfect game type for your character"}
            {step === 4 && "Sit back while we create your personalized game"}
          </p>
        </div>

        {/* Step 1: Drawing */}
        {step === 1 && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <DrawingCanvas 
                onDrawingChange={handleDrawingChange}
                width={600}
                height={400}
              />
              
              <div className="mt-6 text-center">
                <Button
                  onClick={handleSaveAndAnalyze}
                  disabled={!currentDrawing || saveDrawingMutation.isPending}
                  className="btn-coral"
                  data-testid="button-analyze-drawing"
                >
                  {saveDrawingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2" />
                      Analyze & Continue
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="mr-2 text-gold" />
                    Drawing Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="text-turquoise mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>Draw clear, bold lines for better AI recognition</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-turquoise mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>Include facial features and limbs for characters</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-turquoise mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>Use different colors to highlight important parts</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-turquoise mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>Keep drawings simple and recognizable</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Analysis */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-turquoise rounded-full flex items-center justify-center mx-auto mb-4 pulse-animation">
                  <Wand2 className="text-white animate-spin" size={24} />
                </div>
                <h3 className="font-semibold text-foreground mb-2" data-testid="analyzing-title">
                  Analyzing Your Drawing...
                </h3>
                <p className="text-muted-foreground">
                  Our AI is examining your artwork to understand your character's features and abilities.
                </p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Character Detection</span>
                    <Loader2 className="text-turquoise animate-spin" size={16} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Feature Analysis</span>
                    <Loader2 className="text-orange animate-spin" size={16} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Game Suggestions</span>
                    <Loader2 className="text-coral animate-spin" size={16} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Game Type Selection */}
        {step === 3 && analysis && (
          <div className="space-y-8">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4" data-testid="analysis-results">
                  Analysis Results
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Character Type</p>
                    <p className="text-foreground capitalize" data-testid="character-type">{analysis.characterType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Suggested Abilities</p>
                    <p className="text-foreground" data-testid="character-abilities">
                      {analysis.abilities.join(', ') || 'Basic movement'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="font-heading text-2xl text-primary mb-6 text-center">
                Choose Your Game Type
              </h3>
              <GameTypesGrid
                onSelectType={handleGameTypeSelect}
                selectedType={selectedGameType}
              />
            </div>

            {selectedGameType && (
              <Card className="max-w-md mx-auto">
                <CardContent className="p-6">
                  <Label htmlFor="game-title">Game Title</Label>
                  <Input
                    id="game-title"
                    value={gameTitle}
                    onChange={(e) => setGameTitle(e.target.value)}
                    placeholder="Enter a title for your game"
                    className="mb-4"
                    data-testid="input-game-title"
                  />
                  <Button
                    onClick={handleGenerateGame}
                    className="btn-coral w-full"
                    data-testid="button-generate-game"
                  >
                    <Play className="mr-2" />
                    Generate Game
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 4: Game Generation & Preview */}
        {step === 4 && (
          <div className="max-w-4xl mx-auto">
            <GamePreview
              game={generatedGame || undefined}
              isGenerating={generateGameMutation.isPending}
              onPlay={() => generatedGame && window.open(`/game/${generatedGame.id}`, '_blank')}
            />
            
            {generatedGame && (
              <div className="flex justify-center space-x-4 mt-8">
                <Button
                  onClick={() => window.open(`/game/${generatedGame.id}`, '_blank')}
                  className="btn-coral"
                  data-testid="button-play-generated"
                >
                  <Play className="mr-2" />
                  Play Game
                </Button>
                <Button
                  onClick={resetWorkflow}
                  variant="outline"
                  data-testid="button-create-another"
                >
                  Create Another
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        {step > 1 && step < 4 && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={() => setStep(Math.max(1, step - 1))}
              variant="outline"
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2" />
              Back
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
