import React, { useState, useEffect, useCallback } from 'react';
import { PageResponse } from '../types';
import Pagination from './Pagination';
import { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import './CrudPage.css';

export interface CrudColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

export interface CrudField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'email' | 'password' | 'datetime';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  parse?: (value: string) => any;
}

interface CrudPageProps<T> {
  title: string;
  icon: string;
  subtitle?: string;
  loadPage: (page: number) => Promise<PageResponse<T>>;
  columns: CrudColumn<T>[];
  fields: CrudField[];
  getRowId: (row: T) => number;
  buildForm: (row: T | null) => Record<string, any>;
  onCreate: (form: Record<string, any>) => Promise<void>;
  onUpdate: (id: number, form: Record<string, any>) => Promise<void>;
  onDelete: (row: T) => Promise<void>;
}

const CrudPage = <T,>({
  title,
  icon,
  subtitle,
  loadPage,
  columns,
  fields,
  getRowId,
  buildForm,
  onCreate,
  onUpdate,
  onDelete,
}: CrudPageProps<T>) => {
  const [rows, setRows] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const load = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      try {
        const data = await loadPage(targetPage);
        setRows(data.content);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (error) {
        setError(getErrorMessage(error, 'Failed to load data'));
      } finally {
        setLoading(false);
      }
    },
    [loadPage]
  );

  useEffect(() => {
    load(0);
  }, [load]);

  const openCreate = () => {
    setEditingRow(null);
    setForm(buildForm(null));
    setError('');
    setShowModal(true);
  };

  const openEdit = (row: T) => {
    setEditingRow(row);
    setForm(buildForm(row));
    setError('');
    setShowModal(true);
  };

  const handleFieldChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, any> = {};
      for (const field of fields) {
        let value = form[field.name];
        if (typeof value === 'string' && value.trim() === '') {
          value = null;
        }
        if (value !== null && field.parse) {
          value = field.parse(value);
        }
        payload[field.name] = value;
      }
      if (editingRow) {
        await onUpdate(getRowId(editingRow), payload);
        toast.success('Updated successfully.');
      } else {
        await onCreate(payload);
        toast.success('Created successfully.');
      }
      setShowModal(false);
      load(editingRow ? page : 0);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save'));
      setError(getErrorMessage(error, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: T) => {
    try {
      await onDelete(row);
      toast.success('Deleted successfully.');
      load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete'));
    }
  };

  return (
    <div className="crud-page">
      <div className="main-container">
        <div className="flex-between wrap mb-16">
          <div className="page-header crud-header">
            <h1>
              <i className={`fas ${icon}`}></i> {title}
            </h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="btn btn-gold" onClick={openCreate}>
            <i className="fas fa-plus"></i> Add New
          </button>
        </div>

        {error && !showModal && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h3>No records found</h3>
            <p>Click "Add New" to create your first record.</p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex-between">
              <span className="text-muted">
                {totalElements} record{totalElements === 1 ? '' : 's'}
              </span>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={getRowId(row)}>
                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.render ? col.render(row) : String((row as any)[col.key] ?? '—')}
                        </td>
                      ))}
                      <td className="text-right">
                        <div className="table-actions">
                          <button className="btn btn-sm btn-outline" onClick={() => openEdit(row)}>
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(row)}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={load} />
          </>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box crud-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  <i className="fas fa-edit"></i>
                  {editingRow ? 'Edit' : 'Add'} {title}
                </h2>
                <button className="close-modal" onClick={() => setShowModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {error && (
                    <div className="error-message mb-16">
                      <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                  )}
                  {fields.map((field) => (
                    <div className="form-group" key={field.name}>
                      <label htmlFor={`crud-${field.name}`}>
                        {field.label}
                        {field.required && <span className="required-star"> *</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          id={`crud-${field.name}`}
                          value={form[field.name] ?? ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          id={`crud-${field.name}`}
                          value={form[field.name] ?? ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                        >
                          <option value="">— Select —</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'datetime' ? (
                        <input
                          id={`crud-${field.name}`}
                          type="datetime-local"
                          value={form[field.name] ?? ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                        />
                      ) : (
                        <input
                          id={`crud-${field.name}`}
                          type={field.type}
                          value={form[field.name] ?? ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-cream" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                    {saving ? ' Saving...' : ' Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrudPage;
