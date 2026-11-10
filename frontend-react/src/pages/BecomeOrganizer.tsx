import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification, OrganizerApplication } from '../types';
import { notificationService, organizerApplicationService, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import './BecomeOrganizer.css';

const BecomeOrganizer: React.FC = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [application, setApplication] = useState<OrganizerApplication | null>(null);
  const [approvedNotification, setApprovedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');
  const [eventIdea, setEventIdea] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const loadApplication = async () => {
    setLoading(true);
    try {
      const data = await organizerApplicationService.getMine({ size: 5 });
      setApplication(data.content[0] || null);
      const notif = await notificationService.getAll({ type: 'ORGANIZER_APPROVED', size: 5 });
      setApprovedNotification(notif.content[0] || null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load your application status'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') {
      navigate('/dashboard');
      return;
    }
    loadApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    setFiles((prev) => [...prev, ...selected].slice(0, 3));
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivation.trim() || !experience.trim() || !eventIdea.trim()) {
      setError('Please fill in your motivation, experience and event idea — only the documents are optional.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const created = await organizerApplicationService.apply(
        { motivation, experience, eventIdea },
        files
      );
      setApplication(created);
      setMotivation('');
      setExperience('');
      setEventIdea('');
      setFiles([]);
      toast.success('Application submitted! The admin will review it soon.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit your application'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : '';

  const renderStatus = () => {
    if (!application) return null;
    const status = application.status;

    if (status === 'PENDING') {
      return (
        <div className="app-status-card status-pending">
          <div className="status-icon">
            <i className="fas fa-hourglass-half"></i>
          </div>
          <h2>Application Under Review</h2>
          <p>
            Submitted on {formatDate(application.createdAt)}. Our team will review your application and
            you'll be notified the moment a decision is made.
          </p>
          <div className="app-answers">
            {application.motivation && (
              <div className="app-answer">
                <span className="app-answer-label">Why you want to organize</span>
                <p>{application.motivation}</p>
              </div>
            )}
            {application.experience && (
              <div className="app-answer">
                <span className="app-answer-label">Your experience</span>
                <p>{application.experience}</p>
              </div>
            )}
            {application.eventIdea && (
              <div className="app-answer">
                <span className="app-answer-label">Event idea</span>
                <p>{application.eventIdea}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (status === 'APPROVED') {
      return (
        <div className="app-status-card status-approved">
          <div className="status-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>Welcome to the Organizer Team!</h2>
          <p>
            Your application was approved on {formatDate(application.reviewedAt || application.createdAt)}.
            Your student account stays exactly the same — a brand new <strong>Club Organizer</strong> account
            was created for you.
          </p>
          {approvedNotification && (
            <div className="app-credentials">
              <span className="app-answer-label">Your new organizer account</span>
              <p className="app-credentials-text">{approvedNotification.message}</p>
            </div>
          )}
          <div className="app-tip">
            <i className="fas fa-lightbulb"></i>
            Sign out and log back in with the new email and password above, then change your password
            anytime from your Profile.
          </div>
          <div className="status-actions">
            <button className="btn btn-gold" onClick={logout}>
              <i className="fas fa-sign-out-alt"></i> Sign Out & Log In as Organizer
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/profile')}>
              <i className="fas fa-user-cog"></i> Go to Profile
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="app-status-card status-rejected">
        <div className="status-icon">
          <i className="fas fa-xmark-circle"></i>
        </div>
        <h2>Application Not Approved</h2>
        <p>
          We're sorry, your application to become a club organizer was not approved on{' '}
          {formatDate(application.reviewedAt || application.createdAt)}.
        </p>
        {application.rejectionReason && (
          <div className="app-rejection-reason">
            <span className="app-answer-label">Reason</span>
            <p>{application.rejectionReason}</p>
          </div>
        )}
        <p className="app-again-hint">
          Don't worry — you're welcome to try again with more details.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            setApplication(null);
            setError('');
          }}
        >
          <i className="fas fa-redo"></i> Apply Again
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="become-page">
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="become-page">
      <Navbar />

      <div className="main-container">
        <div className="page-header">
          <h1>
            <i className="fas fa-user-tie"></i> Become a Club Organizer
          </h1>
          <p>Take your passion to the next level and organize campus events</p>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {application ? (
          renderStatus()
        ) : (
          <div className="become-card">
            <div className="become-hero">
              <div className="become-hero-icon">
                <i className="fas fa-bullhorn"></i>
              </div>
              <div>
                <h2>Ready to organize events?</h2>
                <p>
                  It's easy — no experience required. Tell us a little about yourself and our admin team
                  will review your application.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="become-fields">
                <div className="form-group">
                  <label>
                    <i className="fas fa-heart"></i> Why do you want to become an organizer?
                    <span className="required-tag">required</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    placeholder="e.g. I love bringing students together and want to host fun, meaningful events..."
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-medal"></i> Any previous event experience?
                    <span className="required-tag">required</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. I helped organize a class party or a club meetup..."
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-lightbulb"></i> Tell us about an event you'd like to organize
                    <span className="required-tag">required</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={eventIdea}
                    onChange={(e) => setEventIdea(e.target.value)}
                    placeholder="e.g. A campus talent show, a career fair, a movie night..."
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-paperclip"></i> Optional supporting documents
                    <span className="optional-tag">optional</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                    onChange={handleFileChange}
                  />
                  <p className="file-hint">
                    Up to 3 files (CV, certificates, proposals) — PDF, Word, images or text.
                  </p>
                  {files.length > 0 && (
                    <div className="file-list">
                      {files.map((file, index) => (
                        <div className="file-chip" key={`${file.name}-${index}`}>
                          <i className="fas fa-file"></i>
                          <span>{file.name}</span>
                          <button type="button" onClick={() => removeFile(index)} title="Remove">
                            <i className="fas fa-xmark"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="become-actions">
                <button type="submit" className="btn btn-gold" disabled={submitting}>
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BecomeOrganizer;
