const { supabase } = require('../config/supabase');

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ 
                success: false,
                error: "User ID is required" 
            });
        }
        
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: "User not found" 
            });
        }
        
        // Remove sensitive information
        const { password, ...userWithoutPassword } = user;
        
        res.json({
            success: true,
            data: userWithoutPassword
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};


// Update user information
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (!id) {
            return res.status(400).json({ 
                success: false,
                error: "User ID is required" 
            });
        }
        
        // Remove sensitive fields that shouldn't be updated directly
        delete updates.id;
        delete updates.created_at;
        delete updates.password; // Password updates should be handled separately
        
        const { data: updated, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: "User not found" 
            });
        }
        
        // Remove sensitive information
        const { password, ...userWithoutPassword } = updated;
        
        res.json({
            success: true,
            data: userWithoutPassword,
            message: "User updated successfully"
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get user profile with statistics
const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ 
                success: false,
                error: "User ID is required" 
            });
        }
        
        const { data: user, error: userErr } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (userErr) throw userErr;
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: "User not found" 
            });
        }
        
        // Get user's games count
        const { data: games, error: gamesErr } = await supabase
            .from('games')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false });
        if (gamesErr) throw gamesErr;
        
        // Remove sensitive information
        const { password, ...userWithoutPassword } = user;
        
        res.json({
            success: true,
            data: {
                ...userWithoutPassword,
                stats: {
                    totalGames: games.length,
                    recentGames: games.slice(0, 5) // Last 5 games
                }
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};


module.exports = {
    getUserById,
    updateUser,
    getUserProfile
};
