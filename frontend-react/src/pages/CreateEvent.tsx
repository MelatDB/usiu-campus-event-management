import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Venue, Club, School, Program, EventPayload } from '../types';
import { eventService, categoryService, venueService, clubService, schoolService, programService, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import './CreateEvent.css';

const CreateEvent: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    registrationDeadline: '',
    maximumCapacity: 50,
    categoryId: '',
    venueId: '',
    clubId: '',
    openToAllStudents: false,
    targetSchoolId: '',
    targetProgramIds: [] as number[],
    targetYearOfStudy: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (user.role !== 'CLUB_ORGANIZER' && user.role !== 'ADMINISTRATOR')) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [categoriesData, venuesData, clubsData, schoolsData, programsData] = await Promise.all([
        categoryService.getAll({ size: 100 }),
        venueService.getAll({ size: 100 }),
        clubService.getAll({ size: 100 }),
        schoolService.getAll({ size: 100 }),
        programService.getAll({ size: 100 }),
      ]);

      setCategories(categoriesData.content);
      setVenues(venuesData.content);
      setClubs(clubsData.content);
      setSchools(schoolsData.content);
      setPrograms(programsData.content);
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to load form data'));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked, targetSchoolId: '', targetProgramIds: [] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const schoolId = parseInt(e.target.value);
    setSelectedSchool(schoolId || null);
    setFormData((prev) => ({ ...prev, targetSchoolId: e.target.value, targetProgramIds: [] }));
  };

  const handleProgramToggle = (programId: number) => {
    setFormData((prev) => ({
      ...prev,
      targetProgramIds: prev.targetProgramIds.includes(programId)
        ? prev.targetProgramIds.filter((id) => id !== programId)
        : [...prev.targetProgramIds, programId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (new Date(formData.startDateTime) >= new Date(formData.endDateTime)) {
      setError('End date/time must be after start date/time');
      return;
    }
    if (new Date(formData.registrationDeadline) >= new Date(formData.startDateTime)) {
      setError('Registration deadline must be before event start date');
      return;
    }
    if (new Date(formData.startDateTime) <= new Date()) {
      setError('Event start date/time must be in the future');
      return;
    }
    if (!formData.clubId) {
      setError('Please select a club');
      return;
    }

    setLoading(true);

    try {
      const payload: EventPayload = {
        title: formData.title,
        description: formData.description,
        startDateTime: new Date(formData.startDateTime).toISOString(),
        endDateTime: new Date(formData.endDateTime).toISOString(),
        registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
        maximumCapacity: parseInt(String(formData.maximumCapacity)),
        clubId: parseInt(formData.clubId),
        categoryId: parseInt(formData.categoryId),
        venueId: parseInt(formData.venueId),
        targetSchoolId: formData.targetSchoolId ? parseInt(formData.targetSchoolId) : null,
        targetProgramIds: formData.targetProgramIds,
        openToAllStudents: formData.openToAllStudents,
        targetYearOfStudy: formData.targetYearOfStudy ? parseInt(formData.targetYearOfStudy) : null,
      };

      await eventService.create(payload);
      toast.success('Event created successfully! It will be pending admin approval.');
      navigate('/my-events');
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to create event'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const filteredPrograms = selectedSchool
    ? programs.filter((p) => p.schoolId === selectedSchool)
    : [];

  return (
    <div className="create-event-page">
      <Navbar />

      <div className="main-container">
        <div className="page-header">
          <h1>
            <i className="fas fa-plus-circle"></i>
            Create New Event
          </h1>
          <p>Fill in the details to create a new campus event</p>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-section">
            <h2>
              <i className="fas fa-info-circle"></i> Basic Information
            </h2>

            <div className="form-group">
              <label>Event Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter event description"
                rows={4}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Club *</label>
                <select name="clubId" value={formData.clubId} onChange={handleChange} required>
                  <option value="">Select Club</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.clubName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Venue *</label>
              <select name="venueId" value={formData.venueId} onChange={handleChange} required>
                <option value="">Select Venue</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.venueName} (Capacity: {venue.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>
              <i className="fas fa-calendar-alt"></i> Schedule
            </h2>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date & Time *</label>
                <input
                  type="datetime-local"
                  name="startDateTime"
                  value={formData.startDateTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date & Time *</label>
                <input
                  type="datetime-local"
                  name="endDateTime"
                  value={formData.endDateTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Registration Deadline *</label>
                <input
                  type="datetime-local"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Maximum Capacity *</label>
                <input
                  type="number"
                  name="maximumCapacity"
                  value={formData.maximumCapacity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>
              <i className="fas fa-users"></i> Target Audience
            </h2>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="openToAllStudents"
                  checked={formData.openToAllStudents}
                  onChange={handleChange}
                />
                <span>Open to All Students</span>
              </label>
            </div>

            {!formData.openToAllStudents && (
              <>
                <div className="form-group">
                  <label>Target School</label>
                  <select value={formData.targetSchoolId} onChange={handleSchoolChange}>
                    <option value="">All Schools</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.schoolName}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSchool && filteredPrograms.length > 0 && (
                  <div className="form-group">
                    <label>Target Programs (Select Multiple)</label>
                    <div className="checkbox-list">
                      {filteredPrograms.map((program) => (
                        <label key={program.id} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={formData.targetProgramIds.includes(program.id)}
                            onChange={() => handleProgramToggle(program.id)}
                          />
                          <span>{program.programName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Target Year of Study</label>
                  <select
                    name="targetYearOfStudy"
                    value={formData.targetYearOfStudy}
                    onChange={handleChange}
                  >
                    <option value="">All Years</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/my-events')}>
              <i className="fas fa-times"></i> Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i> Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
