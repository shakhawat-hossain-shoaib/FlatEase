import Layout from '../Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, FileText, AlertCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminDashboard() {

  const stats = [
    { title: 'Total Tenants', value: '248', change: '+12% from last month', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Active Leases', value: '186', change: '94.5% occupancy', icon: FileText, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'Expiring Leases', value: '14', change: 'Next 30 days', icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { title: 'Open Complaints', value: '7', change: '3 urgent', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  ];

  const recentActivity = [
    { action: 'New lease signed', tenant: 'John Doe', unit: 'A-301', time: '2 hours ago' },
    { action: 'Payment received', tenant: 'Sarah Smith', unit: 'B-105', time: '5 hours ago' },
    { action: 'Maintenance request', tenant: 'Mike Johnson', unit: 'C-204', time: '1 day ago' },
    { action: 'Lease renewal', tenant: 'Emma Wilson', unit: 'A-102', time: '2 days ago' },
  ];

  return (
    <Layout
      userRole="admin"
      onLogout={() => {
        try {
          window.location.href = route('login');
        } catch (e) {
          window.location.href = '/login';
        }
      }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-semibold text-gray-900 mb-2">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.change}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Overview */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Revenue Overview</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-lg font-semibold text-gray-900">$124,500</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-gray-600">Collected</p>
                    <p className="text-sm font-semibold text-gray-900">$105,825</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Pending</p>
                    <p className="text-sm font-semibold text-orange-600">$18,675</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Overdue</p>
                    <p className="text-sm font-semibold text-red-600">$3,200</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.tenant} • Unit {activity.unit}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors" onClick={() => alert('Add Tenant clicked')}>
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <span className="text-sm text-gray-700">Add Tenant</span>
              </button>
              <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors" onClick={() => alert('Create Lease clicked')}>
                <FileText className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <span className="text-sm text-gray-700">Create Lease</span>
              </button>
              <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors" onClick={() => alert('Record Payment clicked')}>
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <span className="text-sm text-gray-700">Record Payment</span>
              </button>
              <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors" onClick={() => alert('View Complaints clicked')}>
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <span className="text-sm text-gray-700">View Complaints</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
