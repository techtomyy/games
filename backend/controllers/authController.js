const { supabase } = require('../config/supabase');


// User signup
const signup = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        
        // Validate required fields
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({
                success: false,
                error: "All fields (firstname, lastname, email, password) are required"
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: "Invalid email format"
            });
        }
        
        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 6 characters long"
            });
        }
        
        // Sign up user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    first_name: firstname,
                    last_name: lastname,
                    full_name: `${firstname} ${lastname}`
                }
            }
        });
        
        if (error) {
            console.error('Signup error:', error);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        // If user is created but needs email confirmation
        if (data.user && !data.session) {
            return res.status(201).json({
                success: true,
                message: "User created successfully. Please check your email to confirm your account.",
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    firstname: firstname,
                    lastname: lastname,
                    email_confirmed: data.user.email_confirmed_at ? true : false
                }
            });
        }
        
        // If user is created and session is available (email confirmation disabled)
        if (data.user && data.session) {
            return res.status(201).json({
                success: true,
                message: "User created and logged in successfully",
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    firstname: firstname,
                    lastname: lastname,
                    email_confirmed: data.user.email_confirmed_at ? true : false
                },
                session: {
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_at: data.session.expires_at
                }
            });
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error during signup"
        });
    }
};

// User login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required"
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: "Invalid email format"
            });
        }
        
        // First, try to sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('Login error:', error);
            console.error('Error message:', error.message);
            console.error('Error code:', error.status);
            
            // Check if the error is related to email confirmation
            // Supabase typically returns various messages for unconfirmed emails
            const errorMessage = error.message ? error.message.toLowerCase() : '';
            const errorStatus = error.status || error.statusCode || 0;
            
            // Check for email confirmation related errors - be more specific to avoid false positives
            const isEmailConfirmationError = (
                errorMessage.includes('email not confirmed') ||
                errorMessage.includes('email_not_confirmed') ||
                errorMessage.includes('email address not confirmed') ||
                errorMessage.includes('confirm your email') ||
                errorMessage.includes('email confirmation') ||
                errorMessage.includes('please confirm your email') ||
                errorMessage.includes('confirm your email address') ||
                errorMessage.includes('email verification required') ||
                errorMessage.includes('please verify your email') ||
                errorMessage.includes('verify your email address') ||
                // Only check specific error codes that are known to indicate email confirmation issues
                (errorStatus === 403 && errorMessage.includes('email'))
            );
            
            if (isEmailConfirmationError) {
                return res.status(403).json({
                    success: false,
                    error: "Email not confirmed. Please check your inbox and click the confirmation link before logging in. If you don't see the email, check your spam folder or request a new confirmation email."
                });
            }
            
            // Remove the fallback resend check as it was causing false positives
            // We'll rely only on Supabase's direct error messages for email confirmation detection
            
            // For other authentication errors, return generic message
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
            });
        }
        
        if (data.user && data.session) {
            // Double-check if email is confirmed (additional safety check)
            if (!data.user.email_confirmed_at) {
                return res.status(403).json({
                    success: false,
                    error: "Email not confirmed. Please check your inbox and click the confirmation link before logging in. If you don't see the email, check your spam folder or request a new confirmation email."
                });
            }
            
            return res.json({
                success: true,
                message: "Login successful",
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    firstname: data.user.user_metadata?.first_name || '',
                    lastname: data.user.user_metadata?.last_name || '',
                    fullname: data.user.user_metadata?.full_name || '',
                    email_confirmed: data.user.email_confirmed_at ? true : false,
                    created_at: data.user.created_at
                },
                session: {
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_at: data.session.expires_at
                }
            });
        }
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error during login"
        });
    }
};

// User logout
const logout = async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('Logout error:', error);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.json({
            success: true,
            message: "Logout successful"
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error during logout"
        });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: "No authentication token provided"
            });
        }
        
        // Set the session using the token
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error) {
            console.error('Get user error:', error);
            return res.status(401).json({
                success: false,
                error: "Invalid or expired token"
            });
        }
        
        if (user) {
            return res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    firstname: user.user_metadata?.first_name || '',
                    lastname: user.user_metadata?.last_name || '',
                    fullname: user.user_metadata?.full_name || '',
                    email_confirmed: user.email_confirmed_at ? true : false,
                    created_at: user.created_at,
                    last_sign_in: user.last_sign_in_at
                }
            });
        }
        
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Refresh token
const refreshToken = async (req, res) => {
    try {
        const { refresh_token } = req.body;
        
        if (!refresh_token) {
            return res.status(400).json({
                success: false,
                error: "Refresh token is required"
            });
        }
        
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refresh_token
        });
        
        if (error) {
            console.error('Refresh token error:', error);
            return res.status(401).json({
                success: false,
                error: "Invalid or expired refresh token"
            });
        }
        
        if (data.session) {
            return res.json({
                success: true,
                message: "Token refreshed successfully",
                session: {
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_at: data.session.expires_at
                }
            });
        }
        
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error during token refresh"
        });
    }
};

// Forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Email is required"
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: "Invalid email format"
            });
        }
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
        });
        
        if (error) {
            console.error('Forgot password error:', error);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.json({
            success: true,
            message: "Password reset email sent successfully"
        });
        
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Update password
const updatePassword = async (req, res) => {
    try {
        const { new_password } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Authentication token is required"
            });
        }
        
        if (!new_password) {
            return res.status(400).json({
                success: false,
                error: "New password is required"
            });
        }
        
        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 6 characters long"
            });
        }
        
        // Set the session using the token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !user) {
            return res.status(401).json({
                success: false,
                error: "Invalid or expired token"
            });
        }
        
        const { error } = await supabase.auth.updateUser({
            password: new_password
        });
        
        if (error) {
            console.error('Update password error:', error);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.json({
            success: true,
            message: "Password updated successfully"
        });
        
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Resend email confirmation
const resendConfirmation = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Email is required"
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: "Invalid email format"
            });
        }
        
        // Resend confirmation email
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email
        });
        
        if (error) {
            console.error('Resend confirmation error:', error);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.json({
            success: true,
            message: "Confirmation email sent successfully. Please check your inbox."
        });
        
    } catch (error) {
        console.error('Resend confirmation error:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};


module.exports = {
    signup,
    login,
    logout,
    getCurrentUser,
    refreshToken,
    forgotPassword,
    updatePassword,
    resendConfirmation
};
