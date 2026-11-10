import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, schoolService, programService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import './Register.css';

const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    registrationNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    schoolId: '',
    programId: '',
    yearOfStudy: '',
  });

  const [schools, setSchools] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    schoolService.getAll({ size: 100 }).then((data) => setSchools(data.content)).catch(console.error);
  }, []);

  const handleSchoolChange = async (schoolId: number) => {
    setFormData((prev) => ({ ...prev, schoolId: String(schoolId), programId: '' }));
    try {
      const data = await programService.getAll({ schoolId, size: 100 });
      setPrograms(data.content);
    } catch {
      setPrograms([]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'schoolId' && value) {
      handleSchoolChange(parseInt(value, 10));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) return 'First and last name are required';
    if (!formData.registrationNumber.trim()) return 'Registration number is required';
    if (!/^[\w.-]+@[\w-]+\.[\w.]+$/.test(formData.email)) return 'Enter a valid email address';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.schoolId) return 'Please select your school';
    if (!formData.programId) return 'Please select your program';
    if (!formData.yearOfStudy) return 'Please select your year of study';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        registrationNumber: formData.registrationNumber.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim() || undefined,
        schoolId: parseInt(formData.schoolId, 10),
        programId: parseInt(formData.programId, 10),
        yearOfStudy: parseInt(formData.yearOfStudy, 10),
      });

      setSuccess('Account created successfully!');
      await login(formData.email.trim(), formData.password);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Registration failed. Please check your details.';
      const fieldErrors = err?.response?.data?.fieldErrors;
      if (fieldErrors) {
        setError(Object.values(fieldErrors).join(', '));
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page login-page-register">
      <div className="login-bg-shapes" aria-hidden="true">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-layout">
        <div className="login-branding">
          <img src="/usiu-logo.png" alt="USIU-Africa logo" className="branding-logo-img" />
          <h2 className="branding-subtitle">Campus Event Management System</h2>
          <p>
            Discover events tailored to your school, program and year of study.
            Register in seconds and get real-time notifications for what matters to you.
          </p>
          <ul className="branding-features">
            <li>
              <i className="fas fa-star"></i> Smart event recommendations
            </li>
            <li>
              <i className="fas fa-bell"></i> Real-time notifications
            </li>
            <li>
              <i className="fas fa-ticket-alt"></i> Instant event tickets
            </li>
            <li>
              <i className="fas fa-users"></i> Clubs, workshops & competitions
            </li>
          </ul>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h3>Create Student Account</h3>
            <p>Join USIU-Africa Campus Events</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="reg-section">
              <div className="reg-section-title">
                <span>Personal Details</span>
                <b></b>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Melat"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Desta"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g. SST-2026-123"
                  required
                />
              </div>
            </div>

            <div className="reg-section">
              <div className="reg-section-title">
                <span>Contact &amp; Account</span>
                <b></b>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@student.usiu.ac.ke"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 characters"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number (optional)</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g. +254700000000"
                />
              </div>
            </div>

            <div className="reg-section">
              <div className="reg-section-title">
                <span>Academic Details</span>
                <b></b>
              </div>

              <div className="form-group">
                <label>School *</label>
                <select name="schoolId" value={formData.schoolId} onChange={handleChange} required>
                  <option value="">Select your school</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.abbreviation} - {school.schoolName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Program *</label>
                  <select
                    name="programId"
                    value={formData.programId}
                    onChange={handleChange}
                    disabled={!formData.schoolId}
                    required
                  >
                    <option value="">Select program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.programName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year of Study *</label>
                  <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} required>
                    <option value="">Select year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5</option>
                    <option value="6">Year 6</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block login-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </form>

          <div className="login-divider">
            <span>Already have an account?</span>
          </div>

          <p className="login-register-link">
            <Link to="/">Sign in to your account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
