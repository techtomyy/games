const OpenAI = require('openai');

const openai = new OpenAI({
    apikey: process.process.env.OPENAI_API_KEY
});

const analyzeDrawingWithAI = async (req, res) => {
    try {
        const { imagedata } = req.body;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, error: 'Authentication required' });
        if (!imagedata) return res.status(400).json({ success: false, error: 'imagedata is Required' });

        const analysisPrompt = `Analyze this drawing and provide a detailed character analysis in JSON format:
 {
     "characterType": "pet/vehical/monsters/warriors/hero/robot/creature/etc",
     "suggestedGameTypes": ["platformer", "racing", "battle", "pet", "story", "board"],
     "abilities": ["jump", "run", "fly", "swim", "attack", "collect"],
     "animationFrames": 4,
     "physicsProperties": {
         "mass": 1.0,
         "bounce": 0.3,
         "friction": 0.8
     },
     "personality": "brave/friendly/aggressive/curious/etc",
     "specialFeatures": ["wings", "horns", "tail", "armor", "weapons"]
 }`;
        const response = await openai.chat.completions.create({
            model: "gp,t-4-vision-preview",
            messages: [
                {
                    role: "user",
                    Content: [
                        { type: "text", text: analysisPrompt },
                        {
                            type: "image_url",
                            image_url: { url: imagedata }
                        }
                    ]
                }
            ],
            max_tokens:500
        });
        const characterAnalysis =JSON.parse(response.choices[0].message.Content)    
        res.json({
            success:true,
            data:characterAnalysis,
            message: "Character analysis completed!"        })
    } catch(error){
        console.log('AI Analysis error',error);
        res.status(500).json({
            success:false,
            error:error.message || "Failed to analyze drawing with AI"
        });
    }
 };