import React from 'react';
import Navbar from '../components/Navbar';
import CrudPage from '../components/CrudPage';
import { categoryService } from '../services/api';
import { Category, CategoryPayload } from '../types';

const ManageCategories: React.FC = () => {
  return (
    <div>
      <Navbar />
      <CrudPage<Category>
        title="Categories"
        icon="fa-tags"
        subtitle="Manage event categories (sports, academic, social, etc.)"
        loadPage={(page) => categoryService.getAll({ page, size: 10 })}
        getRowId={(row) => row.id}
        columns={[
          { key: 'categoryName', label: 'Category Name' },
          {
            key: 'description',
            label: 'Description',
            render: (row) => row.description || '—',
          },
        ]}
        fields={[
          { name: 'categoryName', label: 'Category Name', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
        ]}
        buildForm={(row) => ({
          categoryName: row?.categoryName ?? '',
          description: row?.description ?? '',
        })}
        onCreate={async (form) => {
          await categoryService.create(form as unknown as CategoryPayload);
        }}
        onUpdate={async (id, form) => {
          await categoryService.update(id, form as unknown as CategoryPayload);
        }}
        onDelete={async (row) => {
          await categoryService.delete(row.id);
        }}
      />
    </div>
  );
};

export default ManageCategories;
