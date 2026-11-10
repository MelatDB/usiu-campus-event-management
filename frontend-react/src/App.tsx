import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Browse from './pages/Browse';
import Favorites from './pages/Favorites';
import MyRegistrations from './pages/MyRegistrations';
import Profile from './pages/Profile';

import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import MyEvents from './pages/MyEvents';
import EventRegistrations from './pages/EventRegistrations';
import EventAnnouncements from './pages/EventAnnouncements';

import Approvals from './pages/Approvals';
import Analytics from './pages/Analytics';
import FeedbackReviews from './pages/FeedbackReviews';
import ManageUsers from './pages/ManageUsers';
import ManageSchools from './pages/ManageSchools';
import ManagePrograms from './pages/ManagePrograms';
import ManageClubs from './pages/ManageClubs';
import ManageCategories from './pages/ManageCategories';
import ManageVenues from './pages/ManageVenues';
import CampusAnnouncements from './pages/CampusAnnouncements';
import BecomeOrganizer from './pages/BecomeOrganizer';
import OrganizerRequests from './pages/OrganizerRequests';

const RootRedirect: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />;
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <NotificationProvider>
          <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <Browse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrations"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <MyRegistrations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/create"
          element={
            <ProtectedRoute roles={['CLUB_ORGANIZER', 'ADMINISTRATOR']}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/edit"
          element={
            <ProtectedRoute roles={['CLUB_ORGANIZER', 'ADMINISTRATOR']}>
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-events"
          element={
            <ProtectedRoute roles={['CLUB_ORGANIZER', 'ADMINISTRATOR']}>
              <MyEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/registrations"
          element={
            <ProtectedRoute roles={['CLUB_ORGANIZER', 'ADMINISTRATOR']}>
              <EventRegistrations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/announcements"
          element={
            <ProtectedRoute roles={['CLUB_ORGANIZER', 'ADMINISTRATOR']}>
              <EventAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback-reviews"
          element={
            <ProtectedRoute roles={['CLUB_ORGANIZER', 'ADMINISTRATOR']}>
              <FeedbackReviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/approvals"
          element={
            <ProtectedRoute roles={['ADMINISTRATOR']}>
              <Approvals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer-requests"
          element={
            <ProtectedRoute roles={['ADMINISTRATOR']}>
              <OrganizerRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer-apply"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <BecomeOrganizer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute roles={['ADMINISTRATOR']}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/users"
          element={
            <ProtectedRoute roles={['ADMINISTRATOR']}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/schools"
          element={
            <ProtectedRoute roles={['ADMINISTRATOR']}>
              <ManageSchools />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/programs"
          element={
            <ProtectedRoute roles={['ADMINISTRATOR']}>
              <ManagePrograms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/clubs"
          element={
            <ProtectedRoute roles={['ADMINISTRATOR']}>
              <ManageClubs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/categories"
          element={
            <ProtectedRoute roles={['ADMINISTRATOR']}>
              <ManageCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/venues"
          element={
            <ProtectedRoute roles={['ADMINISTRATOR']}>
              <ManageVenues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute roles={['ADMINISTRATOR']}>
              <CampusAnnouncements />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
