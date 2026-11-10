import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import CrudPage, { CrudField } from '../components/CrudPage';
import { userService, schoolService, programService } from '../services/api';
import { Program, School, User, UserPayload } from '../types';

const toDatetimeLocal = (iso: string): string => {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const roleBadge = (role: User['role']) => {
  const cls =
    role === 'ADMINISTRATOR'
      ? 'badge-approved'
      : role === 'CLUB_ORGANIZER'
      ? 'badge-pending'
      : 'badge-completed';
  return <span className={`badge ${cls}`}>{role.replace('_', ' ')}</span>;
};

const statusBadge = (status: User['status']) => {
  const cls =
    status === 'ACTIVE'
      ? 'badge-active'
      : status === 'INACTIVE'
      ? 'badge-inactive'
      : status === 'SUSPENDED'
      ? 'badge-suspended'
      : 'badge-pending';
  return <span className={`badge ${cls}`}>{status.replace('_', ' ')}</span>;
};

const ManageUsers: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    Promise.all([
      schoolService.getAll({ size: 100 }),
      programService.getAll({ size: 100 }),
    ])
      .then(([schoolData, programData]) => {
        setSchools(schoolData.content);
        setPrograms(programData.content);
      })
      .catch(() => undefined);
  }, []);

  const fields: CrudField[] = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password (leave blank to keep)', type: 'password' },
    { name: 'phoneNumber', label: 'Phone Number', type: 'text' },
    { name: 'registrationNumber', label: 'Registration Number', type: 'text' },
    { name: 'employeeNumber', label: 'Employee Number', type: 'text' },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'STUDENT', label: 'Student' },
        { value: 'CLUB_ORGANIZER', label: 'Club Organizer' },
        { value: 'ADMINISTRATOR', label: 'Administrator' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'SUSPENDED', label: 'Suspended' },
        { value: 'PENDING', label: 'Pending' },
      ],
    },
    {
      name: 'schoolId',
      label: 'School',
      type: 'select',
      parse: (value) => Number(value),
      options: schools.map((school) => ({ value: String(school.id), label: school.schoolName })),
    },
    {
      name: 'programId',
      label: 'Program',
      type: 'select',
      parse: (value) => Number(value),
      options: programs.map((program) => ({
        value: String(program.id),
        label: program.programName,
      })),
    },
    {
      name: 'yearOfStudy',
      label: 'Year of Study',
      type: 'select',
      parse: (value) => Number(value),
      options: [
        { value: '1', label: 'Year 1' },
        { value: '2', label: 'Year 2' },
        { value: '3', label: 'Year 3' },
        { value: '4', label: 'Year 4' },
      ],
    },
    {
      name: 'expiresAt',
      label: 'Account Expiry (blank = default 1 year for organizers)',
      type: 'datetime',
      parse: (value) => (value ? `${value}:00` : null),
    },
  ];

  const loadPage = useCallback((page: number) => userService.getAll({ page, size: 10 }), []);

  return (
    <div>
      <Navbar />
      <CrudPage<User>
        title="Users"
        icon="fa-users-gear"
        subtitle="Manage student, organizer, and administrator accounts"
        loadPage={loadPage}
        getRowId={(row) => row.id}
        columns={[
          {
            key: 'name',
            label: 'Name',
            render: (row) => (
              <div>
                <div className="user-cell-name">
                  {row.firstName} {row.lastName}
                </div>
                <div className="user-cell-email">{row.email}</div>
              </div>
            ),
          },
          { key: 'role', label: 'Role', render: (row) => roleBadge(row.role) },
          { key: 'status', label: 'Status', render: (row) => statusBadge(row.status) },
          { key: 'schoolName', label: 'School', render: (row) => row.schoolName || '—' },
          {
            key: 'yearOfStudy',
            label: 'Year',
            render: (row) => (row.yearOfStudy ? `Year ${row.yearOfStudy}` : '—'),
          },
          {
            key: 'expiresAt',
            label: 'Expires',
            render: (row) =>
              row.role === 'CLUB_ORGANIZER'
                ? row.expiresAt
                  ? new Date(row.expiresAt).toLocaleDateString()
                  : '—'
                : '—',
          },
        ]}
        fields={fields}
        buildForm={(row) => ({
          firstName: row?.firstName ?? '',
          lastName: row?.lastName ?? '',
          email: row?.email ?? '',
          password: '',
          phoneNumber: row?.phoneNumber ?? '',
          registrationNumber: row?.registrationNumber ?? '',
          employeeNumber: row?.employeeNumber ?? '',
          role: row?.role ?? 'STUDENT',
          status: row?.status ?? 'ACTIVE',
          schoolId: row?.schoolId != null ? String(row.schoolId) : '',
          programId: row?.programId != null ? String(row.programId) : '',
          yearOfStudy: row?.yearOfStudy != null ? String(row.yearOfStudy) : '',
          expiresAt: row?.expiresAt ? toDatetimeLocal(row.expiresAt) : '',
        })}
        onCreate={async (form) => {
          if (!form.password) {
            throw new Error('Password is required when creating a user');
          }
          await userService.create(form as unknown as UserPayload);
        }}
        onUpdate={async (id, form) => {
          await userService.update(id, form as unknown as UserPayload);
        }}
        onDelete={async (row) => {
          await userService.delete(row.id);
        }}
      />
    </div>
  );
};

export default ManageUsers;
