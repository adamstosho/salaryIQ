const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { name, email, password, role, baseSalary, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
      baseSalary,
      department
    });

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          baseSalary: user.baseSalary,
          department: user.department,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        message: 'Account is deactivated'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const token = user.generateAuthToken();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          baseSalary: user.baseSalary,
          department: user.department,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
};


const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('performanceRecords')
      .populate('salaryHistory');

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          baseSalary: user.baseSalary,
          department: user.department,
          createdAt: user.createdAt,
          performanceRecords: user.performanceRecords,
          salaryHistory: user.salaryHistory
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      message: 'Error fetching user data',
      error: error.message
    });
  }
};


const logout = async (req, res) => {
  try {
    
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Error during logout',
      error: error.message
    });
  }
};


const refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const newToken = user.generateAuthToken();

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      message: 'Error refreshing token',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken
}; 