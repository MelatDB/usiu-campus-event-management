import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import CrudPage, { CrudField } from '../components/CrudPage';
import { programService, schoolService } from '../services/api';
import { Program, ProgramPayload, School } from '../types';

const ManagePrograms: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    schoolService
      .getAll({ size: 100 })
      .then((data) => setSchools(data.content))
      .catch(() => setSchools([]));
  }, []);

  const fields: CrudField[] = [
    { name: 'programName', label: 'Program Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    {
      name: 'schoolId',
      label: 'School',
      type: 'select',
      required: true,
      parse: (value) => Number(value),
      options: schools.map((school) => ({ value: String(school.id), label: school.schoolName })),
    },
  ];

  const loadPage = useCallback((page: number) => programService.getAll({ page, size: 10 }), []);

  return (
    <div>
      <Navbar />
      <CrudPage<Program>
        title="Programs"
        icon="fa-graduation-cap"
        subtitle="Manage degree programs offered by each school"
        loadPage={loadPage}
        getRowId={(row) => row.id}
        columns={[
          { key: 'programName', label: 'Program Name' },
          {
            key: 'schoolName',
            label: 'School',
            render: (row) => <span className="badge badge-active">{row.schoolName}</span>,
          },
          {
            key: 'description',
            label: 'Description',
            render: (row) => row.description || '—',
          },
        ]}
        fields={fields}
        buildForm={(row) => ({
          programName: row?.programName ?? '',
          description: row?.description ?? '',
          schoolId: row?.schoolId != null ? String(row.schoolId) : '',
        })}
        onCreate={async (form) => {
          await programService.create(form as unknown as ProgramPayload);
        }}
        onUpdate={async (id, form) => {
          await programService.update(id, form as unknown as ProgramPayload);
        }}
        onDelete={async (row) => {
          await programService.delete(row.id);
        }}
      />
    </div>
  );
};

export default ManagePrograms;
