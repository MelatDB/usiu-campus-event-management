import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrganizerApplication } from '../types';
import { organizerApplicationService, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import './OrganizerRequests.css';

const OrganizerRequests: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<OrganizerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'PENDING' | 'ALL'>('PENDING');
  const [actingId, setActingId] = useState<number | null>(null);

  const [rejecting, setRejecting] = useState<OrganizerApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [approving, setApproving] = useState<OrganizerApplication | null>(null);
  const [approveMessage, setApproveMessage] = useState('');

  const loadApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const status = tab === 'PENDING' ? 'PENDING' : undefined;
      const data = await organizerApplicationService.getAll({ status, size: 100 });
      setApplications(data.content);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load applications'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'ADMINISTRATOR') {
      navigate('/dashboard');
      return;
    }
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, tab]);

  const openApprove = (application: OrganizerApplication) => {
    setApproving(application);
    setApproveMessage('');
  };

  const handleApprove = async () => {
    if (!approving) return;
    setActingId(approving.id);
    try {
      await organizerApplicationService.approve(approving.id, approveMessage.trim());
      toast.success(`${approving.studentName} is now a club organizer.`);
      setApplications((prev) => prev.filter((a) => a.id !== approving.id));
      setApproving(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to approve application'));
    } finally {
      setActingId(null);
    }
  };

  const openReject = (application: OrganizerApplication) => {
    setRejecting(application);
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejecting) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for the rejection.');
      return;
    }
    setActingId(rejecting.id);
    try {
      await organizerApplicationService.reject(rejecting.id, rejectReason.trim());
      toast.success(`${rejecting.studentName}'s application was rejected.`);
      setApplications((prev) => prev.filter((a) => a.id !== rejecting.id));
      setRejecting(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to reject application'));
    } finally {
      setActingId(null);
    }
  };

  const handleDownload = async (application: OrganizerApplication, documentId: number, fileName: string) => {
    try {
      const blob = await organizerApplicationService.downloadDocument(application.id, documentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to download document'));
    }
  };

  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : '—';

  const renderAnswer = (label: string, value?: string | null) => (
    <div className="oa-answer">
      <span className="oa-answer-label">{label}</span>
      <p>{value && value.trim() ? value : 'Not provided'}</p>
    </div>
  );

  return (
    <div className="organizer-requests-page">
      <Navbar />

      <div className="main-container">
        <div className="page-header">
          <h1>
            <i className="fas fa-user-tie"></i> Organizer Requests
          </h1>
          <p>Review students who want to become club organizers</p>
        </div>

        <div className="oa-tabs">
          <button
            className={`oa-tab ${tab === 'PENDING' ? 'active' : ''}`}
            onClick={() => setTab('PENDING')}
          >
            <i className="fas fa-clock"></i> Pending
          </button>
          <button
            className={`oa-tab ${tab === 'ALL' ? 'active' : ''}`}
            onClick={() => setTab('ALL')}
          >
            <i className="fas fa-list"></i> All Applications
          </button>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-user-check"></i>
            <h3>{tab === 'PENDING' ? 'No pending requests' : 'No applications yet'}</h3>
            <p>
              {tab === 'PENDING'
                ? 'Students who apply to become organizers will appear here.'
                : 'Applications will appear once students submit them.'}
            </p>
          </div>
        ) : (
          <div className="oa-list">
            {applications.map((application) => (
              <div className="oa-card" key={application.id}>
                <div className="oa-header">
                  <div className="oa-student">
                    <div className="oa-avatar">
                      {application.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{application.studentName}</h3>
                      <div className="oa-meta">
                        <span>{application.studentEmail}</span>
                        {application.registrationNumber && (
                          <>
                            <span className="oa-sep">•</span>
                            <span>{application.registrationNumber}</span>
                          </>
                        )}
                        <span className="oa-sep">•</span>
                        <span>Submitted {formatDate(application.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`oa-status ${application.status.toLowerCase()}`}>
                    <i
                      className={
                        application.status === 'PENDING'
                          ? 'fas fa-clock'
                          : application.status === 'APPROVED'
                          ? 'fas fa-check'
                          : 'fas fa-xmark'
                      }
                    ></i>{' '}
                    {application.status.toLowerCase()}
                  </span>
                </div>

                <div className="oa-answers">
                  {renderAnswer('Why they want to organize', application.motivation)}
                  {renderAnswer('Experience', application.experience)}
                  {renderAnswer('Event idea', application.eventIdea)}
                </div>

                {application.rejectionReason && (
                  <div className="oa-rejection">
                    <span className="oa-answer-label">Rejection reason</span>
                    <p>{application.rejectionReason}</p>
                  </div>
                )}

                {application.documents.length > 0 && (
                  <div className="oa-documents">
                    <span className="oa-answer-label">Documents</span>
                    <div className="oa-doc-list">
                      {application.documents.map((doc) => (
                        <button
                          key={doc.id}
                          className="oa-doc"
                          onClick={() => handleDownload(application, doc.id, doc.fileName)}
                        >
                          <i className="fas fa-file-download"></i> {doc.fileName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {application.status === 'PENDING' && (
                  <div className="oa-actions">
                    <button
                      className="btn-approve"
                      disabled={actingId === application.id}
                      onClick={() => openApprove(application)}
                    >
                      {actingId === application.id ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-check"></i>
                      )}{' '}
                      Approve
                    </button>
                    <button
                      className="btn-reject"
                      disabled={actingId === application.id}
                      onClick={() => openReject(application)}
                    >
                      <i className="fas fa-xmark"></i> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {approving && (
        <div className="oa-modal-overlay" onClick={() => setApproving(null)}>
          <div className="oa-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              <i className="fas fa-check-circle"></i> Approve Application
            </h3>
            <p>
              Approving <strong>{approving.studentName}</strong> will create a brand new Club Organizer
              account with a temporary password. Their student account stays unchanged.
            </p>
            <label className="oa-modal-label">
              Message from the admin <span>(optional)</span>
            </label>
            <textarea
              rows={3}
              value={approveMessage}
              onChange={(e) => setApproveMessage(e.target.value)}
              placeholder="e.g. Welcome to the team! We look forward to your career fair."
            />
            <div className="oa-modal-actions">
              <button className="btn btn-outline" onClick={() => setApproving(null)}>
                Cancel
              </button>
              <button
                className="btn-approve"
                onClick={handleApprove}
                disabled={actingId === approving.id}
              >
                {actingId === approving.id ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-check"></i>
                )}{' '}
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {rejecting && (
        <div className="oa-modal-overlay" onClick={() => setRejecting(null)}>
          <div className="oa-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              <i className="fas fa-xmark-circle"></i> Reject Application
            </h3>
            <p>
              Rejecting <strong>{rejecting.studentName}</strong>'s application. They will be notified
              with this reason.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. We currently have enough organizers. Please reapply next semester."
              autoFocus
            />
            <div className="oa-modal-actions">
              <button className="btn btn-outline" onClick={() => setRejecting(null)}>
                Cancel
              </button>
              <button
                className="btn-approve"
                style={{ background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' }}
                onClick={handleReject}
                disabled={actingId === rejecting.id}
              >
                {actingId === rejecting.id ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-check"></i>
                )}{' '}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerRequests;
