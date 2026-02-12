import React, { useEffect, useState } from 'react';
import { availabilitySlotApi, type AvailabilitySlot, type CreateSlotDto } from '../api/availabilitySlot';
import { serviceApi, type Service } from '../api/service';
import { businessApi, type Business } from '../api/business';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';

export default function AvailabilitySlots() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<number>(0);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [slotsData, servicesData, businessesData] = await Promise.all([
        availabilitySlotApi.getAll(),
        serviceApi.getAll(),
        businessApi.getAll(),
      ]);
      setSlots(slotsData);
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
    setServiceId(0);
    setStartTime('');
    setEndTime('');
  };

  const formatForInput = (isoString: string): string => {
    // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:MM)
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !startTime || !endTime) return;

    try {
      setSubmitting(true);
      
      // Convert datetime-local format to ISO format for backend
      const startISO = new Date(startTime).toISOString();
      const endISO = new Date(endTime).toISOString();
      
      const data: CreateSlotDto = {
        service_id: serviceId,
        start_time: startISO,
        end_time: endISO,
      };

      if (editingId) {
        await availabilitySlotApi.update(editingId, data);
      } else {
        await availabilitySlotApi.create(data);
      }

      await loadData();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (slot: AvailabilitySlot) => {
    setEditingId(slot.id);
    setServiceId(slot.service_id);
    setStartTime(formatForInput(slot.start_time));
    setEndTime(formatForInput(slot.end_time));
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await availabilitySlotApi.delete(deleteId);
      await loadData();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete slot');
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const canModifySlot = (slot: AvailabilitySlot) => {
    if (!user) return false;
    const service = services.find(s => s.id === slot.service_id);
    if (!service) return false;
    const business = businesses.find(b => b.id === service.business_id);
    return business && business.owner_id === user.id;
  };

  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Unknown Service';
  };

  const getBusinessName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return '';
    const business = businesses.find(b => b.id === service.business_id);
    return business?.name || '';
  };

  const getUserServices = () => {
    if (!user) return [];
    return services.filter(service => {
      const business = businesses.find(b => b.id === service.business_id);
      return business && business.owner_id === user.id;
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading availability slots...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Availability Slots</h1>
          {!showForm && user?.role === 'admin' && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Slot
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
              {editingId ? 'Edit Slot' : 'New Slot'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Service</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                  required
                  disabled={!!editingId}
                >
                  <option value={0}>Select a service</option>
                  {getUserServices().map(service => (
                    <option key={service.id} value={service.id}>
                      {getBusinessName(service.id)} - {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Start Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">End Time</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
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
          {slots.map((slot) => (
            <div key={slot.id} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="mb-2">
                <span className="text-sm text-gray-600">
                  {getBusinessName(slot.service_id)}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{getServiceName(slot.service_id)}</h3>
              
              <div className="mb-3 space-y-1">
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 mr-2">🕐 Start:</span>
                  <span className="font-medium">{formatDateTime(slot.start_time)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 mr-2">🕐 End:</span>
                  <span className="font-medium">{formatDateTime(slot.end_time)}</span>
                </div>
              </div>

              <div className="mb-3">
                <span
                  className={`inline-block px-3 py-1 text-sm rounded ${
                    slot.status === 'available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {slot.status}
                </span>
              </div>

              {canModifySlot(slot) && slot.status === 'available' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(slot)}
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}

              {slot.status === 'BOOKED' && (
                <p className="text-sm text-gray-500 italic">
                  This slot is booked and cannot be modified
                </p>
              )}
            </div>
          ))}
        </div>

        {slots.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No availability slots yet. Add your first slot above!
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Availability Slot"
        message="Are you sure you want to delete this slot? This action cannot be undone."
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
