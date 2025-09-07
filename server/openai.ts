import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key-here"
});

export interface CharacterAnalysis {
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

export interface SpriteAnimationData {
  frames: {
    idle: string[];
    walk: string[];
    jump?: string[];
    attack?: string[];
  };
  dimensions: {
    width: number;
    height: number;
  };
}

export async function analyzeDrawing(base64Image: string): Promise<CharacterAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
      messages: [
        {
          role: "system",
          content: `You are an AI that analyzes hand-drawn characters for game creation. 
          Analyze the drawing and provide game-relevant information in JSON format.
          Consider the character's shape, size, features, and suggest appropriate game mechanics.
          
          Respond with JSON in this exact format:
          {
            "characterType": "string (e.g., 'hero', 'monster', 'vehicle', 'pet')",
            "suggestedGameTypes": ["array of game types like 'platformer', 'racing', 'battle'"],
            "animationFrames": "number of suggested animation frames",
            "physicsProperties": {
              "mass": "number between 0.1-2.0",
              "bounce": "number between 0-1.0", 
              "friction": "number between 0-1.0"
            },
            "abilities": ["array of suggested abilities or movements"]
          }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this hand-drawn character for game creation. What type of character is this and what game mechanics would work best?"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as CharacterAnalysis;
  } catch (error) {
    console.error('Failed to analyze drawing:', error);
    throw new Error("Failed to analyze drawing: " + (error as Error).message);
  }
}

export async function generateGameData(
  characterAnalysis: CharacterAnalysis,
  gameType: string,
  drawingData: string
): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
      messages: [
        {
          role: "system",
          content: `You are a game designer AI that creates game configurations based on character analysis.
          Generate a complete game configuration for a ${gameType} game.
          
          Respond with JSON containing game mechanics, levels, physics settings, and player controls.
          
          For platformer games include: platforms, collectibles, enemies, power-ups, level layout
          For racing games include: track layout, obstacles, speed settings, power-ups
          For battle games include: combat moves, health system, special abilities
          
          Make the game fun, balanced, and appropriate for all ages.`
        },
        {
          role: "user",
          content: `Create a ${gameType} game for this character analysis: ${JSON.stringify(characterAnalysis)}`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const gameData = JSON.parse(response.choices[0].message.content || '{}');
    
    // Add the original drawing as sprite data
    gameData.playerSprite = drawingData;
    gameData.gameType = gameType;
    gameData.characterAnalysis = characterAnalysis;
    
    return gameData;
  } catch (error) {
    console.error('Failed to generate game data:', error);
    throw new Error("Failed to generate game data: " + (error as Error).message);
  }
}

export async function generateSpriteAnimations(
  base64Image: string,
  characterAnalysis: CharacterAnalysis
): Promise<SpriteAnimationData> {
  try {
    // For now, we'll use the original drawing as all animation frames
    // In a full implementation, this would generate multiple animation frames
    const dimensions = {
      width: 64,
      height: 64
    };

    return {
      frames: {
        idle: [base64Image],
        walk: [base64Image, base64Image], // Duplicate for simple animation
        jump: [base64Image],
        attack: characterAnalysis.abilities.length > 0 ? [base64Image] : undefined,
      },
      dimensions
    };
  } catch (error) {
    console.error('Failed to generate sprite animations:', error);
    throw new Error("Failed to generate sprite animations: " + (error as Error).message);
  }
}
