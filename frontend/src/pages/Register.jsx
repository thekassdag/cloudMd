import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Check, X } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const { signup, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const passwordStrength = (password) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
        if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
        if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' };
        return { score, label: 'Strong', color: 'bg-green-500' };
    };

    const strength = passwordStrength(formData.password);

    const validateForm = () => {
        const newErrors = {};

        // First name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        // Last name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Terms validation
        if (!acceptedTerms) {
            newErrors.terms = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        try {
            const name = `${formData.firstName} ${formData.lastName}`;
            await signup(name, formData.email, formData.password);
            toast.success('Account created successfully! Please login.');
            navigate('/auth/login');
        } catch (error) {
            toast.error(error.message || 'Failed to create account. Please try again.');
            console.error('Registration error:', error);
        }
    };

    return (
        <div>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First Name
                        </label>
                        <div className="mt-1">
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                className={`input ${errors.firstName ? 'border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="John"
                            />
                            {errors.firstName && (
                                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last Name
                        </label>
                        <div className="mt-1">
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                className={`input ${errors.lastName ? 'border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="Doe"
                            />
                            {errors.lastName && (
                                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="you@example.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div className="mt-1 relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            className={`input pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="Create a strong password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    {formData.password && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600">Password strength:</span>
                                <span className={`font-medium ${strength.label === 'Weak' ? 'text-red-600' :
                                    strength.label === 'Fair' ? 'text-yellow-600' :
                                        strength.label === 'Good' ? 'text-blue-600' :
                                            'text-green-600'
                                    }`}>{strength.label}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all ${strength.color}`}
                                    style={{ width: `${(strength.score / 5) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password
                    </label>
                    <div className="mt-1 relative">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            className={`input pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="Confirm your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <p className="mt-1 text-sm text-green-600 flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Passwords match
                        </p>
                    )}
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                            <X className="h-4 w-4 mr-1" />
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                <div>
                    <div className="flex items-start">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => {
                                setAcceptedTerms(e.target.checked);
                                if (errors.terms) {
                                    const newErrors = { ...errors };
                                    delete newErrors.terms;
                                    setErrors(newErrors);
                                }
                            }}
                            className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5 ${errors.terms ? 'border-red-500' : ''
                                }`}
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                            I agree to the{' '}
                            <button
                                type="button"
                                onClick={() => toast.info('Terms and conditions will be displayed')}
                                className="text-primary-600 hover:text-primary-500 font-medium"
                            >
                                Terms and Conditions
                            </button>
                            {' '}and{' '}
                            <button
                                type="button"
                                onClick={() => toast.info('Privacy policy will be displayed')}
                                className="text-primary-600 hover:text-primary-500 font-medium"
                            >
                                Privacy Policy
                            </button>
                        </label>
                    </div>
                    {errors.terms && (
                        <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
                    )}
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                            Already have an account?
                        </span>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <Link to="/auth/login" className="text-primary-600 hover:text-primary-500 font-medium">
                        Sign in to existing account
                    </Link>
                </div>
            </div>
        </div>
    );
}
