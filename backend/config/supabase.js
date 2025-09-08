const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables. Please check your .env file.');
    console.error('Required variables: SUPABASE_URL, SUPABASE_ANON_KEY');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection function
const testConnection = async () => {
    try {
        // Test connection by making a simple query to the users table
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Supabase connection successful');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message);
        return false;
    }
};

// Database helper functions
const dbHelpers = {
    // User operations
    async createUser(userData) {
        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async getUserById(id) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },

    async getUserByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
        return data;
    },

    async updateUser(id, updates) {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async deleteUser(id) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    },

    // Authentication helpers
    async createUserProfile(authUser, userData) {
        const profileData = {
            id: authUser.id,
            email: authUser.email,
            first_name: userData.firstname,
            last_name: userData.lastname,
            full_name: `${userData.firstname} ${userData.lastname}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('users')
            .insert([profileData])
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async updateUserProfile(id, updates) {
        const { data, error } = await supabase
            .from('users')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    },

    // Game operations
    async createGame(gameData) {
        const { data, error } = await supabase
            .from('games')
            .insert([gameData])
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async getGamesByUserId(userId) {
        const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async getGameById(id) {
        const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },

    async updateGame(id, updates) {
        const { data, error } = await supabase
            .from('games')
            .update(updates)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async deleteGame(id) {
        const { error } = await supabase
            .from('games')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    },

    // Drawing operations
    async saveDrawing(drawingData) {
        const { data, error } = await supabase
            .from('drawings')
            .insert([drawingData])
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async getDrawingsByGameId(gameId) {
        const { data, error } = await supabase
            .from('drawings')
            .select('*')
            .eq('game_id', gameId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }
};

module.exports = {
    supabase,
    testConnection,
    dbHelpers
};
