import React from 'react';
import Navbar from '../components/Navbar';
import CrudPage from '../components/CrudPage';
import { venueService } from '../services/api';
import { Venue, VenuePayload } from '../types';

const availabilityBadge = (status: Venue['availabilityStatus']) => {
  const cls =
    status === 'AVAILABLE'
      ? 'badge-available'
      : status === 'UNDER_MAINTENANCE'
      ? 'badge-pending'
      : 'badge-unavailable';
  return <span className={`badge ${cls}`}>{status.replace('_', ' ')}</span>;
};

const ManageVenues: React.FC = () => {
  return (
    <div>
      <Navbar />
      <CrudPage<Venue>
        title="Venues"
        icon="fa-location-dot"
        subtitle="Manage campus venues and their availability"
        loadPage={(page) => venueService.getAll({ page, size: 10 })}
        getRowId={(row) => row.id}
        columns={[
          { key: 'venueName', label: 'Venue Name' },
          { key: 'building', label: 'Building' },
          { key: 'roomNumber', label: 'Room', render: (row) => row.roomNumber || '—' },
          {
            key: 'capacity',
            label: 'Capacity',
            render: (row) => <span className="badge badge-confirmed">{row.capacity}</span>,
          },
          {
            key: 'availabilityStatus',
            label: 'Availability',
            render: (row) => availabilityBadge(row.availabilityStatus),
          },
        ]}
        fields={[
          { name: 'venueName', label: 'Venue Name', type: 'text', required: true },
          { name: 'building', label: 'Building', type: 'text', required: true },
          { name: 'roomNumber', label: 'Room Number', type: 'text' },
          {
            name: 'capacity',
            label: 'Capacity',
            type: 'number',
            required: true,
            parse: (value) => Number(value),
          },
          {
            name: 'availabilityStatus',
            label: 'Availability Status',
            type: 'select',
            required: true,
            options: [
              { value: 'AVAILABLE', label: 'Available' },
              { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
              { value: 'UNAVAILABLE', label: 'Unavailable' },
            ],
          },
        ]}
        buildForm={(row) => ({
          venueName: row?.venueName ?? '',
          building: row?.building ?? '',
          roomNumber: row?.roomNumber ?? '',
          capacity: row?.capacity != null ? String(row.capacity) : '',
          availabilityStatus: row?.availabilityStatus ?? 'AVAILABLE',
        })}
        onCreate={async (form) => {
          await venueService.create(form as unknown as VenuePayload);
        }}
        onUpdate={async (id, form) => {
          await venueService.update(id, form as unknown as VenuePayload);
        }}
        onDelete={async (row) => {
          await venueService.delete(row.id);
        }}
      />
    </div>
  );
};

export default ManageVenues;
