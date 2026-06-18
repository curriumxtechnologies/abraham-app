import { useState } from 'react';
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
  Bug
} from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout';

const AdminComplaints = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHostel, setFilterHostel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [complaints, setComplaints] = useState([
    {
      id: 1,
      studentName: 'John Doe',
      studentId: 'STU/2024/001',
      hostelName: 'Hostel A',
      roomNumber: 'Room 3',
      bunkNumber: 'Bunk 2',
      type: 'Plumbing',
      location: 'Bathroom',
      title: 'Leaking Pipe in Bathroom',
      description: 'The pipe under the sink has been leaking for two days. Water is spreading across the bathroom floor and making it slippery.',
      status: 'In Progress',
      date: 'Jun 18, 2026',
      time: '10:30 AM',
      images: 2,
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      studentId: 'STU/2024/002',
      hostelName: 'Hostel B',
      roomNumber: 'Room 7',
      bunkNumber: 'Bunk 4',
      type: 'Furniture',
      location: 'Room',
      title: 'Broken Study Chair',
      description: 'My study chair is broken. The backrest has come off completely and I cannot use it for studying.',
      status: 'Submitted',
      date: 'Jun 18, 2026',
      time: '08:15 AM',
      images: 1,
    },
    {
      id: 3,
      studentName: 'Mike Johnson',
      studentId: 'STU/2024/003',
      hostelName: 'Hostel A',
      roomNumber: 'Room 2',
      bunkNumber: 'Bunk 1',
      type: 'Electrical',
      location: 'Room',
      title: 'Faulty Electrical Socket',
      description: 'The electrical socket near my bunk is not working. It sparks when I try to plug anything in.',
      status: 'Acknowledged',
      date: 'Jun 17, 2026',
      time: '02:45 PM',
      images: 0,
    },
    {
      id: 4,
      studentName: 'Sarah Williams',
      studentId: 'STU/2024/004',
      hostelName: 'Hostel C',
      roomNumber: 'Room 5',
      bunkNumber: 'Bunk 3',
      type: 'Cleaning',
      location: 'Bathroom',
      title: 'Bathroom Not Cleaned',
      description: 'The shared bathroom on our floor hasn\'t been cleaned for over a week.',
      status: 'Resolved',
      date: 'Jun 16, 2026',
      time: '11:00 AM',
      images: 0,
    },
    {
      id: 5,
      studentName: 'David Brown',
      studentId: 'STU/2024/005',
      hostelName: 'Hostel A',
      roomNumber: 'Room 1',
      bunkNumber: 'Bunk 6',
      type: 'Plumbing',
      location: 'Toilet',
      title: 'Toilet Not Flushing',
      description: 'The toilet in our bathroom is not flushing properly. Water keeps running.',
      status: 'Closed',
      date: 'Jun 15, 2026',
      time: '09:30 AM',
      images: 3,
    },
    {
      id: 6,
      studentName: 'Emily Davis',
      studentId: 'STU/2024/006',
      hostelName: 'Hostel B',
      roomNumber: 'Room 8',
      bunkNumber: 'Bunk 2',
      type: 'Painting',
      location: 'Room',
      title: 'Peeling Paint on Walls',
      description: 'The paint on the walls in my room is peeling off badly.',
      status: 'Submitted',
      date: 'Jun 18, 2026',
      time: '07:00 AM',
      images: 1,
    },
  ]);

  const complaintTypes = [
    { id: 'plumbing', label: 'Plumbing', icon: Droplets, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'electrical', label: 'Electrical', icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { id: 'furniture', label: 'Furniture', icon: Armchair, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'cleaning', label: 'Cleaning', icon: Wind, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'painting', label: 'Painting', icon: PaintBucket, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { id: 'door-window', label: 'Door/Window', icon: DoorOpen, color: 'text-red-600', bgColor: 'bg-red-50' },
    { id: 'temperature', label: 'Temperature', icon: Thermometer, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
    { id: 'pest-control', label: 'Pest Control', icon: Bug, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  ];

  const hostels = ['all', 'Hostel A', 'Hostel B', 'Hostel C'];
  const statuses = ['all', 'Submitted', 'Acknowledged', 'In Progress', 'Resolved', 'Closed'];
  const types = ['all', 'Plumbing', 'Electrical', 'Furniture', 'Cleaning', 'Painting', 'Door/Window', 'Temperature', 'Pest Control'];

  const getStatusColor = (status) => {
    const colors = {
      'Submitted': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Acknowledged': 'bg-blue-50 text-blue-700 border-blue-200',
      'In Progress': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Resolved': 'bg-green-50 text-green-700 border-green-200',
      'Closed': 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[status] || colors['Submitted'];
  };

  const getStatusDot = (status) => {
    const dots = {
      'Submitted': 'bg-yellow-500',
      'Acknowledged': 'bg-blue-500',
      'In Progress': 'bg-indigo-500',
      'Resolved': 'bg-green-500',
      'Closed': 'bg-gray-400',
    };
    return dots[status] || 'bg-yellow-500';
  };

  const getTypeDetails = (type) => {
    return complaintTypes.find(t => t.label === type) || { icon: AlertCircle, color: 'text-gray-500', bgColor: 'bg-gray-50' };
  };

  const getNextStatus = (currentStatus) => {
    const flow = ['Submitted', 'Acknowledged', 'In Progress', 'Resolved', 'Closed'];
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex < flow.length - 1) {
      return flow[currentIndex + 1];
    }
    return null;
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdatingStatus(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setComplaints(prevComplaints =>
      prevComplaints.map(complaint =>
        complaint.id === complaintId
          ? { ...complaint, status: newStatus }
          : complaint
      )
    );
    
    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
    }
    
    setUpdatingStatus(false);
  };

  const filteredComplaints = complaints
    .filter(complaint => {
      if (filterHostel !== 'all' && complaint.hostelName !== filterHostel) return false;
      if (filterStatus !== 'all' && complaint.status !== filterStatus) return false;
      if (filterType !== 'all' && complaint.type !== filterType) return false;
      if (searchQuery && !complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !complaint.studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !complaint.studentId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time);
      if (sortBy === 'oldest') return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);
      if (sortBy === 'status') {
        const order = ['Submitted', 'Acknowledged', 'In Progress', 'Resolved', 'Closed'];
        return order.indexOf(a.status) - order.indexOf(b.status);
      }
      return 0;
    });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Submitted' || c.status === 'Acknowledged').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length,
  };

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintModal(true);
  };

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
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
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
              {hostels.map(h => (
                <option key={h} value={h}>{h === 'all' ? 'All Hostels' : h}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0E2F76]"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0E2F76]"
            >
              {types.map(t => (
                <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>
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
                const typeDetails = getTypeDetails(complaint.type);
                const TypeIcon = typeDetails.icon;
                const nextStatus = getNextStatus(complaint.status);
                
                return (
                  <tr 
                    key={complaint.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-200"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleComplaintClick(complaint)}>
                        <div className="w-9 h-9 rounded-full bg-[#0E2F76]/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-[#0E2F76]">
                            {complaint.studentName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{complaint.studentName}</p>
                          <p className="text-xs text-gray-400">{complaint.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {complaint.hostelName}, {complaint.roomNumber}
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-700 max-w-[200px] truncate">{complaint.title}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <TypeIcon size={14} className={typeDetails.color} />
                        <span className="text-sm text-gray-600">{complaint.type}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(complaint.status)}`}></span>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        <p>{complaint.date}</p>
                        <p className="text-xs text-gray-400">{complaint.time}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {nextStatus && (
                        <button
                          onClick={() => handleStatusChange(complaint.id, nextStatus)}
                          disabled={updatingStatus}
                          className="px-3 py-1.5 bg-[#0E2F76] text-white rounded-lg text-xs font-medium hover:bg-[#0a2560] transition-all duration-200 disabled:opacity-50 whitespace-nowrap"
                        >
                          Mark as {nextStatus}
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
                const typeDetails = getTypeDetails(selectedComplaint.type);
                const TypeIcon = typeDetails.icon;
                const nextStatus = getNextStatus(selectedComplaint.status);
                
                return (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-[#0E2F76] flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {selectedComplaint.studentName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{selectedComplaint.studentName}</h3>
                        <p className="text-sm text-gray-500">{selectedComplaint.studentId}</p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(selectedComplaint.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(selectedComplaint.status)}`}></span>
                          {selectedComplaint.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Issue Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <TypeIcon size={14} className={typeDetails.color} />
                            <span className="text-sm text-gray-700">{selectedComplaint.type}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900">{selectedComplaint.title}</h3>
                          <p className="text-xs text-gray-500 leading-relaxed">{selectedComplaint.description}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Location & Time</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 size={14} className="text-gray-400" />
                            <span className="text-gray-700">{selectedComplaint.hostelName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Bed size={14} className="text-gray-400" />
                            <span className="text-gray-700">{selectedComplaint.roomNumber} • {selectedComplaint.bunkNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-gray-700">{selectedComplaint.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-gray-700">{selectedComplaint.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedComplaint.images > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Attachments ({selectedComplaint.images} images)
                        </h4>
                        <div className="flex gap-2">
                          {[...Array(selectedComplaint.images)].map((_, i) => (
                            <div key={i} className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">Img {i + 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {nextStatus && (
                      <button
                        onClick={() => handleStatusChange(selectedComplaint.id, nextStatus)}
                        disabled={updatingStatus}
                        className="w-full py-3 bg-[#0E2F76] text-white rounded-xl font-medium text-sm hover:bg-[#0a2560] transition-all duration-200 disabled:opacity-50"
                      >
                        {updatingStatus ? 'Updating...' : `Mark as ${nextStatus}`}
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