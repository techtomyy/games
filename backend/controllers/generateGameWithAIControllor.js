const openai = require("../config/openai");
const { supabase } = require("../config/supabase");
const sharp = require("sharp");

const PLACEHOLDER_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABJklEQVR4nO3asQ2DMBBF0RVRl5EGx3IfxUgqwAw8hxVtyklg8W/jGzqzs6d7bYfj2jEQAAAAAAAAAAgA8EqdnYzj6H1e2jZxW3HyE6TtQ3WEXmpZbAHR1oGoW8Le6ZzHZc0p6uQb0dpyE4ehu0qaFvR7YcX3pJENHRiutPGRq6LHRpIuRRXhzRyMr8YQO8MfdEakfLLsT2oz5HnM6/4hNVXCOtQmNnHsy9Tgyg12uQhO+J63En6x4k6u6Fdb0zXPjInF4AOq29Itl1lCPHVxM2Ev7B8rBMu4g3X+oX6d4fqpQx1NcbwkAAAAAAAAAAKChh1r1nE5WfX9OAAAAAElFTkSuQmCC";

const generateSpritesBatch = async (prompt, key, n = 4, size = 64) => {
  try {
    const imgResp = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      n,
    });

    return await Promise.all(
      imgResp.data.map(async (d) => {
        const buffer = Buffer.from(d.b64_json, "base64"); // still available
        const resized = await sharp(buffer)
          .resize(size, size, { fit: "contain" })
          .png()
          .toBuffer();
        return `data:image/png;base64,${resized.toString("base64")}`;
      })
    );
  } catch (e) {
    console.warn(`Sprite gen failed for ${key}:`, e.message);
    return Array(n).fill(`data:image/png;base64,${PLACEHOLDER_BASE64}`);
  }
};


const generateGameWithAI = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { imagedata, gameType, title, characterAnalysis } = req.body;

    if (!userId)
      return res.status(401).json({ success: false, error: "Authentication required" });
    if (!imagedata)
      return res.status(400).json({ success: false, error: "imagedata is required" });
    if (!gameType)
      return res.status(400).json({ success: false, error: "gameType is required" });

    let analysis = characterAnalysis || {
      characterType: "hero",
      abilities: ["jump"],
      physicsProperties: { mass: 1, bounce: 0.3, friction: 0.8 },
    };

    // ✅ Updated universal prompt with per-gameType physics + controls
    const universalPrompt = `
You are a game design assistant that generates PhaserJS 3 game configurations and sprite plans.
Your response must be STRICT JSON only.

### JSON Schema
{
  "gameConfig": {
    "type": "Phaser.AUTO",
    "width": number,
    "height": number,
    "backgroundColor": string,
    "physics": object,
    "controls": object,
    "levels": [
      { "name": string, "difficulty": "easy"|"medium"|"hard", "goal": string }
    ],
    "scoring": { "collectible"?: number, "enemyDefeat"?: number, "lapComplete"?: number },
    "specialAbilities": string[]
  },
  "spritePlan": {
    "characters": [
      { "name": string, "animations": string[], "style": "pixel-art", "size": "64x64", "background": "transparent" }
    ],
    "enemies"?: [ { "name": string, "animations": string[], "style": "pixel-art", "size": "64x64", "background": "transparent" } ],
    "objects"?: [ { "type": string, "style": "pixel-art", "size": "64x64", "background": "transparent" } ],
    "environment"?: [ { "name": string, "type": string, "style": "pixel-art", "size": "64x64", "background": "transparent" } ]
  }
}

### Rules
- Match physics + controls to gameType:

**Platformer Adventure**
- Physics: { gravity: 500, moveSpeed: 200, jumpForce: -300 }
- Controls: { left: "LEFT", right: "RIGHT", jump: "SPACE" }
- Env: platforms, sky background, coins

**Speed Racer**
- Physics: { accel: 300, maxSpeed: 400, turnRate: 150 }
- Controls: { accelerate: "UP", brake: "DOWN", left: "LEFT", right: "RIGHT" }
- Env: road track, checkpoints, lap counting

**Battle Arena**
- Physics: { moveSpeed: 250 }
- Controls: { left: "LEFT", right: "RIGHT", up: "UP", down: "DOWN", attack: "SPACE" }
- Env: arena walls, enemies

**Pet Adventure**
- Physics: { gravity: 300, moveSpeed: 180, jumpForce: -250 }
- Controls: { left: "LEFT", right: "RIGHT", jump: "SPACE" }
- Env: magical background, collectibles (gems, food)

- Always include at least 1 level with a goal.
- Always include spritePlan for characters, at least one environment element.
`;

    const configResp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: universalPrompt }],
      max_tokens: 1200,
    });

    let parsed;
    try {
      parsed = JSON.parse(configResp.choices[0].message.content);
    } catch {
      const raw = configResp.choices[0].message.content || "";
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    const gameConfig = parsed.gameConfig || {};
    const spritePlan = parsed.spritePlan || { characters: [] };

    // --- Generate Sprites ---
    const spriteFrames = {};

    for (const char of spritePlan.characters || []) {
      spriteFrames[char.name] = {};
      for (const anim of char.animations || []) {
        const prompt = `Pixel-art sprite for character "${char.name}", animation "${anim}", 64x64, transparent background.`;
        spriteFrames[char.name][anim] = await generateSpritesBatch(prompt, `${char.name}_${anim}`, 4);
      }
    }

    for (const enemy of spritePlan.enemies || []) {
      spriteFrames[enemy.name] = {};
      for (const anim of enemy.animations || []) {
        const prompt = `Pixel-art sprite for enemy "${enemy.name}", animation "${anim}", 64x64, transparent background.`;
        spriteFrames[enemy.name][anim] = await generateSpritesBatch(prompt, `${enemy.name}_${anim}`, 4);
      }
    }

    for (const obj of spritePlan.objects || []) {
      const prompt = `Pixel-art object: ${obj.type}, 64x64, transparent background.`;
      spriteFrames[obj.type] = await generateSpritesBatch(prompt, `object_${obj.type}`, 1);
    }

    for (const env of spritePlan.environment || []) {
      const prompt = `Pixel-art environment element: ${env.type} (${env.name}), 64x64, transparent background.`;
      spriteFrames[`env_${env.type}_${env.name}`] = await generateSpritesBatch(prompt, `env_${env.type}_${env.name}`, 1);
    }

    const insertRow = {
      user_id: userId,
      title: title || `${analysis.characterType} ${gameType} Game`,
      game_type: gameType,
      game_data: {
        gameType,
        playerSprite: imagedata,
        characterAnalysis: analysis,
        gameConfig,
        levels: gameConfig.levels || [{ name: "Level 1", difficulty: "easy", goal: "finish" }],
      },
      sprite_data: {
        frames: spriteFrames,
        fps: 6,
        dimensions: { width: 64, height: 64 },
      },
      is_public: false,
      likes: 0,
      plays: 0,
    };

    const { data, error } = await supabase.from("games").insert([insertRow]).select().single();
    if (error) throw error;

    return res.status(201).json({
      success: true,
      data,
      message: "AI PhaserJS game (with proper physics + environment) generated successfully",
    });
  } catch (error) {
    console.error("Generate game error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate game",
    });
  }
};

module.exports.generateGameWithAI = generateGameWithAI;
