import React, { useState, useEffect, useCallback } from 'react';
import { schoolService, programService, categoryService, venueService } from '../services/api';
import './SearchFilters.css';

export interface EventFilters {
  title?: string;
  categoryId?: number;
  schoolId?: number;
  programId?: number;
  venueId?: number;
  fromDate?: string;
  toDate?: string;
}

interface SearchFiltersProps {
  onSearch: (filters: EventFilters) => void;
  compact?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, compact }) => {
  const [filters, setFilters] = useState<EventFilters>({});
  const [schools, setSchools] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);

  const loadFilterData = useCallback(async () => {
    try {
      const [schoolsData, programsData, categoriesData, venuesData] = await Promise.all([
        schoolService.getAll({ size: 100 }),
        programService.getAll({ size: 100 }),
        categoryService.getAll({ size: 100 }),
        venueService.getAll({ size: 100 }),
      ]);
      setSchools(schoolsData.content);
      setPrograms(programsData.content);
      setCategories(categoriesData.content);
      setVenues(venuesData.content);
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  }, []);

  useEffect(() => {
    loadFilterData();
  }, [loadFilterData]);

  const handleChange = (field: keyof EventFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value || undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({});
    onSearch({});
  };

  return (
    <div className={`search-filters ${compact ? 'compact' : ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="filters-grid">
          <div className="filter-item search">
            <label>
              <i className="fas fa-search"></i> Search
            </label>
            <input
              type="text"
              placeholder="Search events by title..."
              value={filters.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          <div className="filter-item">
            <label>
              <i className="fas fa-tag"></i> Category
            </label>
            <select
              value={filters.categoryId || ''}
              onChange={(e) =>
                handleChange('categoryId', e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>
              <i className="fas fa-school"></i> School
            </label>
            <select
              value={filters.schoolId || ''}
              onChange={(e) => {
                const schoolId = e.target.value ? parseInt(e.target.value, 10) : undefined;
                handleChange('schoolId', schoolId);
                if (!schoolId) handleChange('programId', undefined);
              }}
            >
              <option value="">All Schools</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.abbreviation} - {school.schoolName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>
              <i className="fas fa-graduation-cap"></i> Program
            </label>
            <select
              value={filters.programId || ''}
              onChange={(e) =>
                handleChange('programId', e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
            >
              <option value="">All Programs</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.programName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>
              <i className="fas fa-map-marker-alt"></i> Venue
            </label>
            <select
              value={filters.venueId || ''}
              onChange={(e) =>
                handleChange('venueId', e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
            >
              <option value="">All Venues</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.venueName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>
              <i className="fas fa-calendar-start"></i> From Date
            </label>
            <input
              type="date"
              value={filters.fromDate || ''}
              onChange={(e) => handleChange('fromDate', e.target.value)}
            />
          </div>

          <div className="filter-item">
            <label>
              <i className="fas fa-calendar-end"></i> To Date
            </label>
            <input
              type="date"
              value={filters.toDate || ''}
              onChange={(e) => handleChange('toDate', e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-search"></i> Search
            </button>
            <button type="button" className="btn btn-cream" onClick={handleReset}>
              <i className="fas fa-redo"></i> Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchFilters;
