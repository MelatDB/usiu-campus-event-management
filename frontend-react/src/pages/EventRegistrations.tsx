import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AttendanceStatus, Registration } from '../types';
import { eventService, registrationService, attendanceService, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import './EventRegistrations.css';

const registrationStatusBadge = (status: Registration['registrationStatus']) => {
  const cls =
    status === 'REGISTERED'
      ? 'badge-registered'
      : status === 'WAITLISTED'
      ? 'badge-pending'
      : 'badge-cancelled';
  return <span className={`badge ${cls}`}>{status.replace('_', ' ')}</span>;
};

const attendanceStatusBadge = (status: AttendanceStatus) => {
  const cls =
    status === 'PRESENT'
      ? 'badge-present'
      : status === 'CHECKED_IN'
      ? 'badge-checked-in'
      : status === 'ABSENT'
      ? 'badge-absent'
      : 'badge-not-marked';
  return <span className={`badge ${cls}`}>{status.replace('_', ' ')}</span>;
};

const EventRegistrations: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [eventTitle, setEventTitle] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [event, regs] = await Promise.all([
        eventService.getById(Number(id)),
        registrationService.getEventRegistrations(Number(id)),
      ]);
      setEventTitle(event.title);
      setRegistrations(regs.content);
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to load registrations'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user || (user.role !== 'CLUB_ORGANIZER' && user.role !== 'ADMINISTRATOR')) {
      navigate('/dashboard');
      return;
    }
    load();
  }, [user, navigate, load]);

  const handleAttendance = async (registrationId: number, attendanceStatus: AttendanceStatus) => {
    setSavingId(registrationId);
    try {
      const updated = await attendanceService.record(registrationId, attendanceStatus);
      toast.success('Attendance updated.');
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registrationId ? { ...r, attendanceStatus: updated.attendanceStatus } : r
        )
      );
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update attendance'));
    } finally {
      setSavingId(null);
    }
  };

  const registeredCount = registrations.filter((r) => r.registrationStatus === 'REGISTERED').length;
  const presentCount = registrations.filter((r) => r.attendanceStatus === 'PRESENT' || r.attendanceStatus === 'CHECKED_IN').length;

  return (
    <div className="event-registrations-page">
      <Navbar />

      <div className="main-container">
        <div className="flex-between wrap mb-16">
          <div className="page-header">
            <h1>
              <i className="fas fa-clipboard-list"></i> Registrations
            </h1>
            <p>{eventTitle || 'Loading event...'}</p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/my-events')}>
            <i className="fas fa-arrow-left"></i> Back to My Events
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
            <p>Loading registrations...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-user-plus"></i>
            <h3>No registrations yet</h3>
            <p>Students who register for this event will appear here.</p>
          </div>
        ) : (
          <>
            <div className="reg-stats mb-16">
              <div className="stat-chip">
                <i className="fas fa-user-check"></i>
                <strong>{registeredCount}</strong> registered
              </div>
              <div className="stat-chip">
                <i className="fas fa-clipboard-check"></i>
                <strong>{presentCount}</strong> present
              </div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Registered On</th>
                    <th>Registration</th>
                    <th>Attendance</th>
                    <th className="text-right">Mark Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar">
                            {reg.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="student-name">{reg.studentName}</div>
                            <div className="student-sub">Student ID: {reg.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {new Date(reg.registrationDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td>{registrationStatusBadge(reg.registrationStatus)}</td>
                      <td>{attendanceStatusBadge(reg.attendanceStatus)}</td>
                      <td className="text-right">
                        <select
                          className="attendance-select"
                          value={reg.attendanceStatus}
                          disabled={savingId === reg.id || reg.registrationStatus !== 'REGISTERED'}
                          onChange={(e) =>
                            handleAttendance(reg.id, e.target.value as AttendanceStatus)
                          }
                        >
                          <option value="NOT_MARKED">Not Marked</option>
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                          <option value="CHECKED_IN">Checked In</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventRegistrations;
