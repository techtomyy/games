const { supabase } = require('../config/supabase');

// Create a new game
const createGame = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { title, game_type, game_data, sprite_data, is_public } = req.body;

        if (!userId) return res.status(401).json({ success: false, error: 'Authentication required' });
        if (!title || !game_type || !game_data) {
            return res.status(400).json({ success: false, error: 'title, game_type and game_data are required' });
        }

        const { data, error } = await supabase
            .from('games')
            .insert([{ user_id: userId, title, game_type, game_data, sprite_data: sprite_data || null, is_public: !!is_public }])
            .select()
            .single();
        if (error) throw error;
        return res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Create game error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create game' });
    }
};

// List my games
const getMyGames = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // ✅ Always return a consistent JSON structure
    return res.json({
      success: true,
      games: data || []   // instead of "data"
    });

  } catch (error) {
    console.error('Get my games error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch games'
    });
  }
};


// Get public games (optionally filter by type)
const getPublicGames = async (req, res) => {
    try {
        const { type } = req.query;

        let query = supabase
            .from('games')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false });
        if (type) query = query.eq('game_type', type);
        const { data, error } = await query;
        if (error) throw error;
        return res.json({ success: true, data });
    } catch (error) {
        console.error('Get public games error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to fetch public games' });
    }
};

// Get a single game by id (RLS exposes if public or owner)
const getGameById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Game not found' });

        return res.json({ success: true, data });
    } catch (error) {
        const status = error.code === 'PGRST116' ? 404 : 500;
        return res.status(status).json({ success: false, error: error.message || 'Failed to fetch game' });
    }
};

// Update a game (RLS enforces ownership)
const updateGame = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};
        ['title', 'game_type', 'game_data', 'sprite_data', 'is_public'].forEach((k) => {
            if (req.body[k] !== undefined) updates[k] = req.body[k];
        });
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields to update' });
        }

        const { data, error } = await supabase
            .from('games')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return res.json({ success: true, data, message: 'Game updated successfully' });
    } catch (error) {
        console.error('Update game error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to update game' });
    }
};

// Delete a game (RLS enforces ownership)
const deleteGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('games')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return res.json({ success: true, message: 'Game deleted successfully' });
    } catch (error) {
        console.error('Delete game error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to delete game' });
    }
};

// Increment plays counter (simple counter approach)
const incrementPlays = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .rpc('increment_game_field', { game_id: id, field_name: 'plays' });
        if (error) throw error;
        return res.json({ success: true, message: 'Play recorded', data });
    } catch (error) {
        console.error('Increment plays error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to increment plays' });
    }
};

// Increment likes counter (simple counter approach)
const incrementLikes = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .rpc('increment_game_field', { game_id: id, field_name: 'likes' });
        if (error) throw error;
        return res.json({ success: true, message: 'Like recorded', data });
    } catch (error) {
        console.error('Increment likes error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to increment likes' });
    }
};

module.exports = {
    createGame,
    getMyGames,
    getPublicGames,
    getGameById,
    updateGame,
    deleteGame,
    incrementPlays,
    incrementLikes
};

