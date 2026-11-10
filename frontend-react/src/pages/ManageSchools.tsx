import React from 'react';
import Navbar from '../components/Navbar';
import CrudPage from '../components/CrudPage';
import { schoolService } from '../services/api';
import { School, SchoolPayload } from '../types';

const ManageSchools: React.FC = () => {
  return (
    <div>
      <Navbar />
      <CrudPage<School>
        title="Schools"
        icon="fa-school"
        subtitle="Manage the academic schools at USIU-Africa"
        loadPage={(page) => schoolService.getAll({ page, size: 10 })}
        getRowId={(row) => row.id}
        columns={[
          { key: 'schoolName', label: 'School Name' },
          { key: 'abbreviation', label: 'Abbreviation' },
          {
            key: 'programCount',
            label: 'Programs',
            render: (row) => <span className="badge badge-confirmed">{row.programCount}</span>,
          },
          {
            key: 'description',
            label: 'Description',
            render: (row) => row.description || '—',
          },
        ]}
        fields={[
          { name: 'schoolName', label: 'School Name', type: 'text', required: true },
          { name: 'abbreviation', label: 'Abbreviation', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
        ]}
        buildForm={(row) => ({
          schoolName: row?.schoolName ?? '',
          abbreviation: row?.abbreviation ?? '',
          description: row?.description ?? '',
        })}
        onCreate={async (form) => {
          await schoolService.create(form as unknown as SchoolPayload);
        }}
        onUpdate={async (id, form) => {
          await schoolService.update(id, form as unknown as SchoolPayload);
        }}
        onDelete={async (row) => {
          await schoolService.delete(row.id);
        }}
      />
    </div>
  );
};

export default ManageSchools;
