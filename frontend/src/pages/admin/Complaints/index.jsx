import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MessageSquare,
  Download,
  X,
  Building2,
  Bed,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Droplets,
  Zap,
  Armchair,
  Wind,
  DoorOpen,
  PaintBucket,
  Thermometer,
  Bug,
  Loader2,
} from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout';

// ─── API Hooks ──────────────────────────────────────────────────
import {
  useGetComplaintsQuery,
  useMarkAsReadMutation,
  useMarkAsDoneMutation,
} from '../../../slices/complaintApiSlice';

const AdminComplaints = () => {
  const navigate = useNavigate();

  // ─── State ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHostel, setFilterHostel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  // ─── Queries & Mutations ─────────────────────────────────────
  const {
    data: complaintsData,
    isLoading,
    error,
    refetch,
  } = useGetComplaintsQuery();

  const [markAsRead, { isLoading: readLoading }] = useMarkAsReadMutation();
  const [markAsDone, { isLoading: doneLoading }] = useMarkAsDoneMutation();

  // ─── Derived data ─────────────────────────────────────────────
  const complaints = complaintsData?.data || [];

  // ─── UI helpers ──────────────────────────────────────────────
  const complaintTypes = [
    { id: 'plumbing', label: 'Plumbing', icon: Droplets, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'electrical', label: 'Electrical', icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { id: 'furniture', label: 'Furniture', icon: Armchair, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'cleaning', label: 'Cleaning', icon: Wind, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'painting', label: 'Painting', icon: PaintBucket, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { id: 'door-window', label: 'Door/Window', icon: DoorOpen, color: 'text-red-600', bgColor: 'bg-red-50' },
    { id: 'temperature', label: 'Temperature', icon: Thermometer, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
    { id: 'pest-control', label: 'Pest Control', icon: Bug, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    { id: 'general', label: 'General', icon: Wrench, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  ];

  const getTypeDetails = (category) => {
    return complaintTypes.find(t => t.label === category) || complaintTypes[8];
  };

  // Map backend status to display labels
  const statusDisplayMap = {
    pending: 'Submitted',
    read: 'Acknowledged',
    done: 'Resolved',
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      read: 'bg-blue-50 text-blue-700 border-blue-200',
      done: 'bg-green-50 text-green-700 border-green-200',
    };
    return colors[status] || colors.pending;
  };

  const getStatusDot = (status) => {
    const dots = {
      pending: 'bg-yellow-500',
      read: 'bg-blue-500',
      done: 'bg-green-500',
    };
    return dots[status] || 'bg-yellow-500';
  };

  const getNextStatus = (currentStatus) => {
    const flow = ['pending', 'read', 'done'];
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex < flow.length - 1) {
      return flow[currentIndex + 1];
    }
    return null;
  };

  const getNextActionLabel = (status) => {
    const map = {
      pending: 'Mark as Read',
      read: 'Mark as Done',
    };
    return map[status] || null;
  };

  // ─── Handlers ──────────────────────────────────────────────────
  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      if (newStatus === 'read') {
        await markAsRead(complaintId).unwrap();
      } else if (newStatus === 'done') {
        await markAsDone(complaintId).unwrap();
      }
      await refetch();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert(error?.data?.message || 'Failed to update complaint status');
    }
  };

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintModal(true);
  };

  // ─── Filtering & sorting ─────────────────────────────────────
  const filteredComplaints = useMemo(() => {
    // Get unique hostels from complaints (from student allocation)
    // We'll just use a placeholder list for now, or extract from data
    const hostels = ['all', ...new Set(complaints.map(c => c.user?.hostelName || 'Unknown'))].filter(h => h !== 'all' && h !== 'Unknown');
    // For filter, we'll keep using the array we have; but we can just use the raw filter

    return complaints
      .filter(complaint => {
        const studentName = complaint.user?.fullName || '';
        const studentId = complaint.user?.studentId || '';
        const title = complaint.title || '';
        const category = complaint.category || 'General';
        const status = complaint.status || 'pending';
        const hostel = complaint.user?.hostelName || 'Unknown';

        if (filterHostel !== 'all' && hostel !== filterHostel) return false;
        if (filterStatus !== 'all' && status !== filterStatus) return false;
        if (filterType !== 'all' && category !== filterType) return false;
        if (searchQuery && !studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !studentId.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        if (sortBy === 'newest') return dateB - dateA;
        if (sortBy === 'oldest') return dateA - dateB;
        if (sortBy === 'status') {
          const order = ['pending', 'read', 'done'];
          return order.indexOf(a.status) - order.indexOf(b.status);
        }
        return 0;
      });
  }, [complaints, filterHostel, filterStatus, filterType, searchQuery, sortBy]);

  // ─── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const read = complaints.filter(c => c.status === 'read').length;
    const done = complaints.filter(c => c.status === 'done').length;
    return { total, pending, read, done };
  }, [complaints]);

  // ─── Loading / Error ──────────────────────────────────────────
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={40} className="animate-spin text-[#0E2F76]" />
          <span className="ml-3 text-gray-600">Loading complaints...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Failed to load complaints. Please try again.</p>
            <button
              onClick={refetch}
              className="mt-4 px-6 py-2 bg-[#0E2F76] text-white rounded-xl text-sm font-medium hover:bg-[#0a2560]"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ─── Render ────────────────────────────────────────────────────
  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track student complaints
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <MessageSquare size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Complaints</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Wrench size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.read}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.done}</p>
              <p className="text-xs text-gray-500">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student, title or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0E2F76] focus:ring-2 focus:ring-[#0E2F76]/10 transition-all duration-200"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterHostel}
              onChange={(e) => setFilterHostel(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0E2F76]"
            >
              <option value="all">All Hostels</option>
              {/* We can dynamically populate from data, but we'll keep static for now */}
              <option value="Hostel A">Hostel A</option>
              <option value="Hostel B">Hostel B</option>
              <option value="Hostel C">Hostel C</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0E2F76]"
            >
              <option value="all">All Status</option>
              <option value="pending">Submitted</option>
              <option value="read">Acknowledged</option>
              <option value="done">Resolved</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0E2F76]"
            >
              <option value="all">All Types</option>
              {complaintTypes.map(t => (
                <option key={t.id} value={t.label}>{t.label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0E2F76]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="status">By Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hostel</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Issue</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((complaint) => {
                const typeDetails = getTypeDetails(complaint.category || 'General');
                const TypeIcon = typeDetails.icon;
                const nextStatus = getNextStatus(complaint.status);
                const actionLabel = getNextActionLabel(complaint.status);
                const isUpdating = readLoading || doneLoading;

                return (
                  <tr
                    key={complaint._id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-200"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleComplaintClick(complaint)}>
                        <div className="w-9 h-9 rounded-full bg-[#0E2F76]/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-[#0E2F76]">
                            {complaint.user?.fullName?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {complaint.user?.fullName || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-400">{complaint.user?.studentId || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {/* We don't have hostel name directly; we could derive from allocation */}
                      Not available
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-700 max-w-[200px] truncate">{complaint.title}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <TypeIcon size={14} className={typeDetails.color} />
                        <span className="text-sm text-gray-600">{complaint.category || 'General'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(complaint.status)}`}></span>
                        {statusDisplayMap[complaint.status] || complaint.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        <p>{new Date(complaint.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400">{new Date(complaint.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {nextStatus && (
                        <button
                          onClick={() => handleStatusChange(complaint._id, nextStatus)}
                          disabled={isUpdating}
                          className="px-3 py-1.5 bg-[#0E2F76] text-white rounded-lg text-xs font-medium hover:bg-[#0a2560] transition-all duration-200 disabled:opacity-50 whitespace-nowrap"
                        >
                          {isUpdating ? 'Updating...' : actionLabel}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Complaints Found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      {showComplaintModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowComplaintModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Complaint Details</h2>
                <button
                  onClick={() => setShowComplaintModal(false)}
                  className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all duration-200"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {(() => {
                const typeDetails = getTypeDetails(selectedComplaint.category || 'General');
                const TypeIcon = typeDetails.icon;
                const nextStatus = getNextStatus(selectedComplaint.status);
                const actionLabel = getNextActionLabel(selectedComplaint.status);
                const isUpdating = readLoading || doneLoading;

                return (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-[#0E2F76] flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {selectedComplaint.user?.fullName?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {selectedComplaint.user?.fullName || 'Anonymous'}
                        </h3>
                        <p className="text-sm text-gray-500">{selectedComplaint.user?.studentId || 'N/A'}</p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(selectedComplaint.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(selectedComplaint.status)}`}></span>
                          {statusDisplayMap[selectedComplaint.status] || selectedComplaint.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Issue Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <TypeIcon size={14} className={typeDetails.color} />
                            <span className="text-sm text-gray-700">{selectedComplaint.category || 'General'}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900">{selectedComplaint.title}</h3>
                          <p className="text-xs text-gray-500 leading-relaxed">{selectedComplaint.description}</p>
                          {selectedComplaint.anonymous && (
                            <p className="text-xs text-gray-400 italic">Posted anonymously</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Time</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-gray-700">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-gray-700">{new Date(selectedComplaint.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {nextStatus && (
                      <button
                        onClick={() => handleStatusChange(selectedComplaint._id, nextStatus)}
                        disabled={isUpdating}
                        className="w-full py-3 bg-[#0E2F76] text-white rounded-xl font-medium text-sm hover:bg-[#0a2560] transition-all duration-200 disabled:opacity-50"
                      >
                        {isUpdating ? 'Updating...' : actionLabel}
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminComplaints;