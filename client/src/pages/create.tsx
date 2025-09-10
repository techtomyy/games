import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient } from "@/lib/queryClient";

// Local interfaces since we removed shared schema
interface Drawing {
  id: string;
  imageData: string;
  title?: string;
  createdAt: string;
}

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

interface Game {
  id: string;
  title: string;
  gameType: string;
  gameData: any;
  spriteData?: string;
  isPublic: boolean;
  likes: number;
  plays: number;
  createdAt: string;
}
import Header from "@/components/header";
import Footer from "@/components/footer";
import DrawingCanvas from "@/components/drawing-canvas";
import GamePreview from "@/components/game-preview";
import GameTypesGrid from "@/components/game-types-grid";
import CreationProgress from "@/components/creation-progress";
import { Button } from "@/components/ui/button";
import { Input as FileInput } from "@/components/ui/input";
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
  Lightbulb,
  ImageIcon,
  Plus
} from "lucide-react";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stepNames = [
    "Draw Character",
    "Analyze Drawing", 
    "Choose Game Type",
    "Generate Game",
    "Play & Share"
  ];

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

  // Save drawing function (backend first, local fallback)
  const saveDrawing = async (imageData: string) => {
    const fallback = () => {
      const local: Drawing = {
        id: `drawing-${Date.now()}`,
        title: "New Drawing",
        imageData,
        createdAt: new Date().toISOString(),
      };
      const savedDrawings = JSON.parse(localStorage.getItem('drawplay-drawings') || '[]');
      savedDrawings.push(local);
      localStorage.setItem('drawplay-drawings', JSON.stringify(savedDrawings));
      setSavedDrawing(local);
      toast({ title: "Drawing Saved (Local)", description: "Saved to your browser storage." });
    };

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        fallback();
        return;
      }

      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}/drawings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ image_data: imageData, title: 'New Drawing' }),
      });

      const result = await resp.json();
      if (!resp.ok || !result.success) {
        throw new Error(result.error || `Failed with status ${resp.status}`);
      }

      const row = result.data; // { id, user_id, image_data, title, created_at }
      const drawing: Drawing = {
        id: row.id,
        title: row.title,
        imageData: row.image_data,
        createdAt: row.created_at,
      };
      setSavedDrawing(drawing);
      toast({ title: "Drawing Saved", description: "Uploaded to your account." });
    } catch (e) {
      console.error('Save drawing failed, falling back to local:', e);
      fallback();
    }
  };

  // Analyze drawing function
  const analyzeDrawing = async (imageData: string) => {
    setIsProcessing(true);
    
    try {
        const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
        const response = await fetch(`${BASE}/analyze-drawing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ imagedata: imageData })
        });
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error);
        }

        setAnalysis(result.data);
        setStep(3);
        setIsProcessing(false);
        
        toast({
            title: "AI Analysis Complete!",
            description: `Detected a ${result.data.characterType}. Choose your game type!`,
        });
    } catch (error) {
        console.error('AI analysis failed:', error);
        setIsProcessing(false);
        toast({
            title: "Analysis Failed",
            description: "Failed to analyze drawing with AI. Please try again.",
            variant: "destructive",
        });
    }
};
  // Generate game function
  const generateGame = async ({ drawingId, gameType, title }: { drawingId: string; gameType: string; title: string }) => {
    console.log('Starting game generation:', { drawingId, gameType, title });
    setIsProcessing(true);
    setStep(4);
    
    // Simulate game generation delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate game data that works with our game engine
    const mockGame: Game = {
      id: `game-${Date.now()}`,
      title: title || `${gameType} Game`,
      gameType,
      gameData: {
        gameType,
        playerSprite: savedDrawing?.imageData,
        characterAnalysis: analysis || {
          characterType: "hero",
          suggestedGameTypes: [gameType],
          animationFrames: 4,
          physicsProperties: {
            mass: 1.0,
            bounce: 0.3,
            friction: 0.8,
          },
          abilities: ["jump", "run", "attack"],
        },
        levels: [
          { name: "Level 1", difficulty: "easy" },
          { name: "Level 2", difficulty: "medium" },
        ],
      },
      spriteData: JSON.stringify({
        frames: {
          idle: [savedDrawing?.imageData || ''],
          walk: [savedDrawing?.imageData || ''],
        },
        dimensions: { width: 64, height: 64 }
      }),
      isPublic: false,
      likes: 0,
      plays: 0,
      createdAt: new Date().toISOString(),
    };
    
    // Save to localStorage
    const savedGames = JSON.parse(localStorage.getItem('drawplay-games') || '[]');
    savedGames.push(mockGame);
    localStorage.setItem('drawplay-games', JSON.stringify(savedGames));
    
    console.log('Game generated successfully:', mockGame);
    setGeneratedGame(mockGame);
    setStep(5);
    setIsProcessing(false);
      toast({
        title: "Game Generated!",
        description: "Your game is ready to play!",
      });
  };

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
    await saveDrawing(currentDrawing);
    
    // Then analyze it
    setStep(2);
    analyzeDrawing(currentDrawing);
  };

  const handleGameTypeSelect = (gameType: string) => {
    setSelectedGameType(gameType);
    if (analysis) {
      setGameTitle(`${analysis.characterType} ${gameType}`);
    }
  };

  const handleGenerateGame = async () => {
    console.log('Generate game clicked:', { savedDrawing, selectedGameType, gameTitle });
    
    if (!savedDrawing || !selectedGameType) {
      console.log('Missing information:', { savedDrawing: !!savedDrawing, selectedGameType });
      toast({
        title: "Missing Information",
        description: "Please complete all steps first.",
        variant: "destructive",
      });
      return;
    }

    console.log('Calling generateGame...');
    await generateGame({
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
        {/* Progress Indicator */}
        <CreationProgress 
          currentStep={step}
          totalSteps={stepNames.length}
          stepNames={stepNames}
          isProcessing={isProcessing}
        />

        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-4xl text-primary mb-2" data-testid="create-title">
            {step === 1 && "Draw Your Character"}
            {step === 2 && isProcessing ? "Analyzing Your Drawing..." : "Drawing Analyzed!"}
            {step === 3 && "Choose Your Game Type"}
            {step === 4 && isProcessing ? "Generating Your Game..." : "Game Generated!"}
            {step === 5 && "Your Game is Ready!"}
          </h1>
          <p className="text-muted-foreground">
            {step === 1 && "Create your character and bring it to life!"}
            {step === 2 && isProcessing ? "Our AI is analyzing your drawing to understand your character" : "Great! We've analyzed your character. Now choose a game type."}
            {step === 3 && "Pick the perfect game type for your character"}
            {step === 4 && isProcessing ? "Sit back while we create your personalized game" : "Perfect! Your game has been created. Let's play it!"}
            {step === 5 && "Your game is ready to play! You can also share it with others."}
          </p>
        </div>

        {/* Step 1: Drawing */}
        {step === 1 && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <DrawingCanvas 
                key={uploadedImage || 'blank'}
                onDrawingChange={handleDrawingChange}
                width={600}
                height={400}
                initialImageData={uploadedImage}
              />
              
              <div className="mt-6 text-center">
                {/* Upload Controls */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <FileInput
                      ref={fileInputRef as any}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const dataUrl = reader.result as string;
                          setUploadedImage(dataUrl);
                          setCurrentDrawing(dataUrl);
                        };
                        reader.readAsDataURL(file);
                      }}
                      data-testid="input-upload-image"
                    />
                    <span>Upload Image</span>
                  </label>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadedImage('');
                      setCurrentDrawing('');
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '' as any;
                      }
                    }}
                    disabled={!uploadedImage}
                    data-testid="button-remove-image"
                  >
                    Remove Image
                  </Button>
                </div>

                <Button
                  onClick={handleSaveAndAnalyze}
                  disabled={!currentDrawing}
                  className="btn-coral"
                  data-testid="button-analyze-drawing"
                >
                  {false ? (
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
                    <h3 className="font-semibold text-foreground mb-4">
                        AI Analysis Results
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Character Type</p>
                            <p className="text-foreground capitalize">{analysis.characterType}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Suggested Game Types</p>
                            <p className="text-foreground">{analysis.suggestedGameTypes.join(', ')}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Abilities</p>
                            <p className="text-foreground">{analysis.abilities.join(', ')}</p>
                        </div>
                        {/* Personality field removed due to missing property on AnalysisResult */}
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
            {isProcessing ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="text-white animate-spin" size={40} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Generating Your Game...</h3>
                <p className="text-muted-foreground">This may take a few seconds</p>
              </div>
            ) : (
              <>
            <GamePreview
              game={generatedGame || undefined}
                  isGenerating={false}
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
              </>
            )}
          </div>
        )}

        {/* Step 5: Game Complete */}
        {step === 5 && generatedGame && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-white" size={40} />
              </div>
              <h2 className="font-heading text-2xl text-primary mb-2">Congratulations!</h2>
              <p className="text-muted-foreground">
                Your game "{generatedGame.title}" has been created successfully!
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Game Preview */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Your Game</h3>
                <GamePreview 
                  game={generatedGame}
                  onPlay={() => console.log('Playing game')}
                  onLike={() => console.log('Liking game')}
                  onShare={() => console.log('Sharing game')}
                />
              </div>

              {/* Game Stats & Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Game Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Game Type:</span>
                      <span className="font-medium capitalize">{generatedGame.gameType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Character Type:</span>
                      <span className="font-medium">{analysis?.characterType || 'Hero'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>What's Next?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full btn-coral" onClick={() => console.log('Play game')}>
                      <Play className="mr-2" size={16} />
                      Play Your Game
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => window.location.href = '/gallery'}>
                      <ImageIcon className="mr-2" size={16} />
                      View in Gallery
                    </Button>
                    <Button variant="outline" className="w-full" onClick={resetWorkflow}>
                      <Plus className="mr-2" size={16} />
                      Create Another Game
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step > 1 && step < 5 && (
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
