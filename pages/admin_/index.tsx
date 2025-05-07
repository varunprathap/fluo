import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminDashboard = () => {
  const [licenses, setLicenses] = useState({
    used: 5,
    total: 50,
    percentage: 10
  });

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-6">Fluo</h1>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button className="bg-black text-white px-4 py-2 rounded-lg">
            Manage invites
          </button>
          <button className="bg-white text-black px-4 py-2 rounded-lg border border-gray-200">
            Manage groups
          </button>
        </div>

        {/* Action Items */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Action items</h2>
          <div className="space-y-4">
            <div className="bg-[#e8f0fe] p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Add apps</h3>
                  <p className="text-gray-600 text-sm">Authenticate apps for your company or enable members to add themselves</p>
                </div>
              </div>
              <button className="bg-white px-4 py-2 rounded-lg hover:bg-gray-50">View apps</button>
            </div>

            <div className="bg-[#fff8e6] p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Review data policy</h3>
                  <p className="text-gray-600 text-sm">Fluo uses AI which is supported by the third-party service OpenAI. Data sent to OpenAI is never used to train OpenAI models, and is deleted after 30 days.</p>
                </div>
              </div>
              <button className="bg-white px-4 py-2 rounded-lg hover:bg-gray-50">Learn more</button>
            </div>
          </div>
        </section>

        {/* Team Usage */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Team usage</h2>
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Licenses</h3>
              <p className="text-gray-600 mb-4">Using {licenses.used} of {licenses.total} Fluo licenses</p>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-lg font-semibold inline-block text-blue-600">
                      {licenses.percentage}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold inline-block text-gray-600">
                      {licenses.total - licenses.used} licenses available
                    </span>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-full bg-gray-200 rounded-full">
                    <div
                      style={{ width: `${licenses.percentage}%` }}
                      className="h-2 rounded-full bg-blue-600"
                    ></div>
                  </div>
                </div>
                <button className="mt-4 text-gray-700 font-medium">Invite members</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 