import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import NotificationsPanel from './NotificationsPanel';
import './Navbar.css';

interface NavLink {
  label: string;
  path: string;
}

const Navbar: React.FC = () => {
  const { user, logout, unreadCount } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const links: NavLink[] = [
    { label: 'Dashboard', path: '/dashboard' },
  ];

  if (user.role === 'STUDENT') {
    links.push(
      { label: 'Browse Events', path: '/browse' },
      { label: 'My Registrations', path: '/registrations' },
      { label: 'Favorites', path: '/favorites' },
      { label: 'Become Organizer', path: '/organizer-apply' }
    );
  }

  if (user.role === 'CLUB_ORGANIZER') {
    links.push(
      { label: 'My Events', path: '/my-events' },
      { label: 'Create Event', path: '/events/create' },
      { label: 'Feedback', path: '/feedback-reviews' }
    );
  }

  if (user.role === 'ADMINISTRATOR') {
    links.push(
      { label: 'Analytics', path: '/analytics' },
      { label: 'Approvals', path: '/approvals' },
      { label: 'Organizer Requests', path: '/organizer-requests' },
      { label: 'Manage Users', path: '/manage/users' },
      { label: 'Catalog', path: '/manage/schools' },
      { label: 'Announcements', path: '/announcements' }
    );
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const goToProfile = () => navigate('/profile');
  const isActive = (path: string) =>
    location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <div className="nav-brand" onClick={() => navigate('/dashboard')}>
            <img src="/usiu-logo.png" alt="USIU-Africa" className="brand-image" />
          </div>

          <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
            {links.map((link) => (
              <button
                key={link.path}
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => {
                  navigate(link.path);
                  setMobileOpen(false);
                }}
              >
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          <div className="nav-actions">
            <button
              className="notification-bell"
              onClick={() => setShowNotifications(true)}
              aria-label="Notifications"
            >
              Notifications
              {unreadCount > 0 && <span className="bell-count">{unreadCount}</span>}
            </button>

            <button className="user-chip" onClick={goToProfile}>
              <div className="user-avatar">
                {user.firstName.charAt(0).toUpperCase()}
                {user.lastName.charAt(0).toUpperCase()}
              </div>
              <div className="user-chip-text">
                <span className="user-chip-name">
                  {user.firstName} {user.lastName}
                </span>
                <span className="user-chip-role">
                  {user.role.toLowerCase().replace('_', ' ')}
                </span>
              </div>
            </button>

            <button className="logout-btn" onClick={handleLogout} title="Logout">
              Logout
            </button>

            <button
              className="hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </nav>

      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
};

export default Navbar;
