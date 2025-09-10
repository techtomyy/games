const OpenAI = require('openai');
let openaiClient = null;
function getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey });
    }
    return openaiClient;
}

const analyzeDrawingWithAI = async (req, res) => {
    try {
        const { imagedata } = req.body;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, error: 'Authentication required' });
        if (!imagedata) return res.status(400).json({ success: false, error: 'imagedata is required' });
        const openai = getOpenAIClient();
        if (!openai) return res.status(500).json({ success: false, error: 'OpenAI API key not configured' });

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
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: analysisPrompt },
                        { type: "image_url", image_url: { url: imagedata } }
                    ]
                }
            ],
            max_tokens: 500
        });
        let characterAnalysis;
        try {
            characterAnalysis = JSON.parse(response.choices[0].message.content);
        } catch (parseErr) {
            const raw = response.choices[0].message.content || '';
            const match = raw.match(/\{[\s\S]*\}/);
            if (match) {
                characterAnalysis = JSON.parse(match[0]);
            } else {
                throw new Error('AI did not return valid JSON');
            }
        }
        res.json({
            success:true,
            data:characterAnalysis,
            message: "Character analysis completed!"        })
    } catch(error){
        const providerCode = error?.code || error?.error?.code || error?.response?.data?.error?.code;
        const status = error?.status || error?.response?.status;
        // Map invalid key to 401 for clarity
        if (providerCode === 'invalid_api_key' || status === 401) {
            console.error('AI Analysis error AuthenticationError:', error?.message);
            return res.status(401).json({ success: false, error: 'Invalid OpenAI API key' });
        }
        console.error('AI Analysis error:', error?.response?.data || error?.message || error);
        res.status(500).json({
            success:false,
            error: error?.message || "Failed to analyze drawing with AI"
        });
    }
 };

module.exports = { analyzeDrawingWithAI };