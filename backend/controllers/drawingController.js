const { supabase } = require('../config/supabase');

// Create a new drawing
const createDrawing = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { image_data, title } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        if (!image_data) {
            return res.status(400).json({ success: false, error: 'image_data is required' });
        }

        const { data, error } = await supabase
            .from('drawings')
            .insert([{ user_id: userId, image_data, title: title || 'New Drawing' }])
            .select()
            .single();

        if (error) throw error;

        if (error) {
            throw error;
        }

        return res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Create drawing error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create drawing' });
    }
};

// Get all drawings for the authenticated user
const getMyDrawings = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const { data, error } = await supabase
            .from('drawings')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.json({ success: true, data });
    } catch (error) {
        console.error('Get drawings error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to fetch drawings' });
    }
};

// Get a drawing by id (RLS enforces ownership)
const getDrawingById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('drawings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Drawing not found' });
        return res.json({ success: true, data });
    } catch (error) {
        const status = error.code === 'PGRST116' ? 404 : 500;
        return res.status(status).json({ success: false, error: error.message || 'Failed to fetch drawing' });
    }
};

// Update a drawing (RLS enforces ownership)
const updateDrawing = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};
        if (typeof req.body.title === 'string') updates.title = req.body.title;
        if (typeof req.body.image_data === 'string') updates.image_data = req.body.image_data;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields to update' });
        }

        const { data, error } = await supabase
            .from('drawings')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return res.json({ success: true, data, message: 'Drawing updated successfully' });
    } catch (error) {
        console.error('Update drawing error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to update drawing' });
    }
};

// Delete a drawing (RLS enforces ownership)
const deleteDrawing = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('drawings')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return res.json({ success: true, message: 'Drawing deleted successfully' });
    } catch (error) {
        console.error('Delete drawing error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to delete drawing' });
    }
};

module.exports = {
    createDrawing,
    getMyDrawings,
    getDrawingById,
    updateDrawing,
    deleteDrawing
};


