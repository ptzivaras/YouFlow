import React, { useEffect, useState } from 'react';
import { reservationApi, type Reservation } from '../api/reservation';
import { availabilitySlotApi, type AvailabilitySlot } from '../api/availabilitySlot';
import { serviceApi, type Service } from '../api/service';
import { businessApi, type Business } from '../api/business';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';

export default function Reservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelId, setCancelId] = useState<number | null>(null);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmReservationId, setConfirmReservationId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reservationsData, slotsData, servicesData, businessesData] = await Promise.all([
        reservationApi.getAll(),
        availabilitySlotApi.getAll(),
        serviceApi.getAll(),
        businessApi.getAll(),
      ]);
      setReservations(reservationsData);
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

  const handleBookSlot = (slotId: number) => {
    setSelectedSlotId(slotId);
    setShowBookModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedSlotId) return;

    try {
      setSubmitting(true);
      await reservationApi.create({
        slot_id: selectedSlotId,
        notes: notes.trim() || undefined,
      });
      await loadData();
      setShowBookModal(false);
      setSelectedSlotId(0);
      setNotes('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create reservation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReservation = (id: number) => {
    setCancelId(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!cancelId) return;

    try {
      await reservationApi.cancel(cancelId);
      await loadData();
      setShowCancelModal(false);
      setCancelId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel reservation');
      setShowCancelModal(false);
      setCancelId(null);
    }
  };

  const handleConfirmReservation = (id: number) => {
    setConfirmReservationId(id);
    setShowConfirmModal(true);
  };

  const confirmReservation = async () => {
    if (!confirmReservationId) return;

    try {
      await reservationApi.updateStatus(confirmReservationId, 'confirmed');
      await loadData();
      setShowConfirmModal(false);
      setConfirmReservationId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm reservation');
      setShowConfirmModal(false);
      setConfirmReservationId(null);
    }
  };

  const getSlotInfo = (slotId: number) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return null;
    
    const service = services.find(s => s.id === slot.service_id);
    if (!service) return null;
    
    const business = businesses.find(b => b.id === service.business_id);
    
    return { slot, service, business };
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const availableSlots = slots.filter(slot => {
    if (slot.status !== 'available') return false;
    // Only show future slots
    return new Date(slot.start_time) > new Date();
  });

  const myReservations = reservations.filter(res => res.user_id === user?.id);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading reservations...</div>
      </Layout>
    );
  }

  // Admin view - All reservations
  if (user?.role === 'admin') {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Manage Reservations</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {reservations.length === 0 ? (
            <p className="text-gray-500">No reservations yet.</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation) => {
                    const info = getSlotInfo(reservation.slot_id);
                    if (!info) return null;
                    const { slot, service, business } = info;

                    return (
                      <tr key={reservation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          User #{reservation.user_id}
                          {reservation.notes && (
                            <div className="text-xs text-gray-500 mt-1">Note: {reservation.notes}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium">{service.name}</div>
                          {business && <div className="text-gray-500 text-xs">{business.name}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDateTime(slot.start_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-block px-2 py-1 text-xs rounded ${getStatusColor(reservation.status)}`}>
                            {reservation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {reservation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleConfirmReservation(reservation.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleCancelReservation(reservation.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {reservation.status === 'confirmed' && (
                            <button
                              onClick={() => handleCancelReservation(reservation.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <ConfirmModal
            isOpen={showConfirmModal}
            title="Confirm Reservation"
            message="Are you sure you want to confirm this reservation?"
            confirmText="Yes, Confirm"
            cancelText="No"
            onConfirm={confirmReservation}
            onCancel={() => {
              setShowConfirmModal(false);
              setConfirmReservationId(null);
            }}
          />

          <ConfirmModal
            isOpen={showCancelModal}
            title="Cancel Reservation"
            message="Are you sure you want to cancel this reservation?"
            confirmText="Yes, Cancel"
            cancelText="No"
            onConfirm={confirmCancel}
            onCancel={() => {
              setShowCancelModal(false);
              setCancelId(null);
            }}
            danger
          />
        </div>
      </Layout>
    );
  }

  // Customer view - Available slots and my bookings
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Reservations</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* My Reservations */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">My Reservations</h2>
          {myReservations.length === 0 ? (
            <p className="text-gray-500">No reservations yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myReservations.map((reservation) => {
                const info = getSlotInfo(reservation.slot_id);
                if (!info) return null;
                const { slot, service, business } = info;

                return (
                  <div key={reservation.id} className="p-4 border rounded-lg bg-white shadow-sm">
                    {business && (
                      <div className="text-sm text-gray-600 mb-1">{business.name}</div>
                    )}
                    <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                    
                    <div className="mb-3 space-y-1">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 mr-2">🕐 Start:</span>
                        <span className="font-medium">{formatDateTime(slot.start_time)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 mr-2">🕐 End:</span>
                        <span className="font-medium">{formatDateTime(slot.end_time)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 mr-2">💰 Price:</span>
                        <span className="font-medium">€{Number(service.price).toFixed(2)}</span>
                      </div>
                    </div>

                    {reservation.notes && (
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Notes:</strong> {reservation.notes}
                      </p>
                    )}

                    <div className="mb-3">
                      <span className={`inline-block px-3 py-1 text-sm rounded ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </div>

                    {reservation.status === 'pending' && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Slots */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Available Slots</h2>
          {availableSlots.length === 0 ? (
            <p className="text-gray-500">No available slots at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableSlots.map((slot) => {
                const service = services.find(s => s.id === slot.service_id);
                if (!service) return null;
                
                const business = businesses.find(b => b.id === service.business_id);

                return (
                  <div key={slot.id} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                    {business && (
                      <div className="text-sm text-gray-600 mb-1">{business.name}</div>
                    )}
                    <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                    
                    <div className="mb-3 space-y-1 text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">🕐</span>
                        <span>{formatDateTime(slot.start_time)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">⏱️</span>
                        <span>{service.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">💰</span>
                        <span className="font-bold text-blue-600">€{Number(service.price).toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookSlot(slot.id)}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Book Now
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Booking</h3>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-sm">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows={3}
                placeholder="Any special requests or notes..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={confirmBooking}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {submitting ? 'Booking...' : 'Confirm'}
              </button>
              <button
                onClick={() => {
                  setShowBookModal(false);
                  setSelectedSlotId(0);
                  setNotes('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this reservation?"
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        onConfirm={confirmCancel}
        onCancel={() => {
          setShowCancelModal(false);
          setCancelId(null);
        }}
        danger
      />
    </Layout>
  );
}
