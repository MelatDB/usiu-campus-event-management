import React from 'react';
import Navbar from '../components/Navbar';
import CrudPage from '../components/CrudPage';
import { clubService } from '../services/api';
import { Club, ClubPayload } from '../types';

const statusBadge = (status: Club['status']) => {
  const cls =
    status === 'ACTIVE' ? 'badge-active' : status === 'INACTIVE' ? 'badge-inactive' : 'badge-suspended';
  return <span className={`badge ${cls}`}>{status.replace('_', ' ')}</span>;
};

const ManageClubs: React.FC = () => {
  return (
    <div>
      <Navbar />
      <CrudPage<Club>
        title="Clubs"
        icon="fa-users"
        subtitle="Manage student clubs and their advisors"
        loadPage={(page) => clubService.getAll({ page, size: 10 })}
        getRowId={(row) => row.id}
        columns={[
          { key: 'clubName', label: 'Club Name' },
          { key: 'advisorName', label: 'Advisor', render: (row) => row.advisorName || '—' },
          { key: 'status', label: 'Status', render: (row) => statusBadge(row.status) },
          {
            key: 'createdDate',
            label: 'Founded',
            render: (row) =>
              row.createdDate
                ? new Date(row.createdDate).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })
                : '—',
          },
        ]}
        fields={[
          { name: 'clubName', label: 'Club Name', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'advisorName', label: 'Advisor Name', type: 'text' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'SUSPENDED', label: 'Suspended' },
            ],
          },
        ]}
        buildForm={(row) => ({
          clubName: row?.clubName ?? '',
          description: row?.description ?? '',
          advisorName: row?.advisorName ?? '',
          status: row?.status ?? 'ACTIVE',
        })}
        onCreate={async (form) => {
          await clubService.create(form as unknown as ClubPayload);
        }}
        onUpdate={async (id, form) => {
          await clubService.update(id, form as unknown as ClubPayload);
        }}
        onDelete={async (row) => {
          await clubService.delete(row.id);
        }}
      />
    </div>
  );
};

export default ManageClubs;
