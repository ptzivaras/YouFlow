import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to YouFlow!</h2>
          <p className="text-gray-600 mb-6">
            You're logged in as <strong>{user?.email}</strong>
          </p>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              to="/businesses"
              className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🏢 Businesses
              </h3>
              <p className="text-sm text-blue-700">
                Manage your business profiles
              </p>
            </Link>

            <Link
              to="/services"
              className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🛠️ Services
              </h3>
              <p className="text-sm text-blue-700">
                Manage your business services
              </p>
            </Link>

            <Link
              to="/availability-slots"
              className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🕐 Availability
              </h3>
              <p className="text-sm text-blue-700">
                Manage time slots
              </p>
            </Link>

            <Link
              to="/reservations"
              className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📅 Reservations
              </h3>
              <p className="text-sm text-blue-700">
                Book and manage appointments
              </p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
