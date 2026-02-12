import React, { useEffect, useState } from 'react';
import { serviceApi, type Service, type CreateServiceDto } from '../api/service';
import { businessApi, type Business } from '../api/business';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';

export default function Services() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [businessId, setBusinessId] = useState<number>(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, businessesData] = await Promise.all([
        serviceApi.getAll(),
        businessApi.getAll(),
      ]);
      setServices(servicesData);
      setBusinesses(businessesData);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setBusinessId(0);
    setName('');
    setDescription('');
    setPrice('');
    setDurationMinutes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !name.trim() || !price || !durationMinutes) return;

    try {
      setSubmitting(true);
      const data: CreateServiceDto = {
        business_id: businessId,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        duration_minutes: parseInt(durationMinutes),
      };

      if (editingId) {
        await serviceApi.update(editingId, data);
      } else {
        await serviceApi.create(data);
      }

      await loadData();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setBusinessId(service.business_id);
    setName(service.name);
    setDescription(service.description);
    setPrice(service.price.toString());
    setDurationMinutes(service.duration_minutes.toString());
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await serviceApi.delete(deleteId);
      await loadData();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete service');
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const canModifyService = (service: Service) => {
    if (!user) return false;
    const business = businesses.find(b => b.id === service.business_id);
    return business && business.owner_id === user.id;
  };

  const getBusinessName = (businessId: number) => {
    const business = businesses.find(b => b.id === businessId);
    return business?.name || 'Unknown Business';
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading services...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Services</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Service
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Service' : 'New Service'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Business</label>
                <select
                  value={businessId}
                  onChange={(e) => setBusinessId(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                  required
                  disabled={!!editingId}
                >
                  <option value={0}>Select a business</option>
                  {businesses
                    .filter(b => user?.id === b.owner_id)
                    .map(business => (
                      <option key={business.id} value={business.id}>
                        {business.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="mb-4 flex gap-4">
                <div className="flex-1">
                  <label className="block mb-2 font-medium">Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block mb-2 font-medium">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div key={service.id} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="mb-2">
                <span className="text-sm text-gray-600">
                  {getBusinessName(service.business_id)}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              {service.description && (
                <p className="text-gray-600 mb-3">{service.description}</p>
              )}
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-blue-600">€{Number(service.price).toFixed(2)}</span>
                <span className="text-sm text-gray-500">{service.duration_minutes} min</span>
              </div>
              {canModifyService(service) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No services yet. Add your first service above!
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
        danger
      />
    </Layout>
  );
}
