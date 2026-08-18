import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Plus,
  Search,
  Filter,
  Droplets,
  Zap,
  DoorOpen,
  Bath,
  Toilet,
  Armchair,
  Wrench,
  AlertCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Camera,
  X,
  PaintBucket,
  Thermometer,
  Bug,
  Wind,
  Eye,
  EyeOff,
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import FloatingShapes from '../../components/common/FloatingShapes';
import Button from '../../components/buttons/Button';

// ─── API Hooks ──────────────────────────────────────────────────
import {
  useGetComplaintsQuery,
  useCreateComplaintMutation,
} from '../../slices/complaintApiSlice';

const Complaints = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ─── Local state ──────────────────────────────────────────────
  const [showNewComplaint, setShowNewComplaint] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // New complaint form
  const [complaintType, setComplaintType] = useState('');
  const [complaintLocation, setComplaintLocation] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ─── API calls ─────────────────────────────────────────────────
  const {
    data: complaintsData,
    isLoading,
    isError,
    refetch,
  } = useGetComplaintsQuery();

  const [createComplaint] = useCreateComplaintMutation();

  // ─── Derived state ────────────────────────────────────────────
  const complaints = complaintsData?.data || [];

  // ─── Lock body scroll on modal open ──────────────────────────
  useEffect(() => {
    if (showNewComplaint) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showNewComplaint]);

  // ─── UI helpers ──────────────────────────────────────────────
  const getStatusDisplay = (status) => {
    const map = {
      pending: 'Submitted',
      read: 'Acknowledged',
      done: 'Resolved',
    };
    return map[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      read: 'bg-blue-50 text-blue-600 border-blue-200',
      done: 'bg-green-50 text-green-600 border-green-200',
    };
    return colors[status] || colors.pending;
  };

  // Type icons mapping (based on category field)
  const typeIcons = {
    'Plumbing': { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
    'Electrical': { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    'Furniture': { icon: Armchair, color: 'text-purple-500', bg: 'bg-purple-50' },
    'Cleaning': { icon: Wind, color: 'text-green-500', bg: 'bg-green-50' },
    'Painting': { icon: PaintBucket, color: 'text-orange-500', bg: 'bg-orange-50' },
    'Door/Window': { icon: DoorOpen, color: 'text-red-500', bg: 'bg-red-50' },
    'Temperature': { icon: Thermometer, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    'Pest Control': { icon: Bug, color: 'text-rose-500', bg: 'bg-rose-50' },
    'General': { icon: Wrench, color: 'text-gray-500', bg: 'bg-gray-50' },
  };

  const getTypeDetails = (category) => {
    return typeIcons[category] || typeIcons['General'];
  };

  const complaintTypes = Object.keys(typeIcons).map(label => ({ label }));
  // Locations: We don't have a location field, we can either add or skip.
  // For now, we'll use a fixed 'Room' but we could add location to model later.
  const complaintLocations = [
    { id: 'room', label: 'Room' },
    { id: 'bathroom', label: 'Bathroom' },
    { id: 'toilet', label: 'Toilet' },
  ];

  // ─── Filter and search ────────────────────────────────────────
  const filteredComplaints = complaints
    .filter(complaint => {
      if (filterStatus !== 'all' && complaint.status !== filterStatus) return false;
      if (filterType !== 'all' && complaint.category !== filterType) return false;
      if (searchQuery && !complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !complaint.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // ─── Handlers ──────────────────────────────────────────────────
  const handleSubmitComplaint = async () => {
    if (!complaintType || !complaintLocation || !complaintDescription.trim()) return;

    setIsSubmitting(true);
    try {
      await createComplaint({
        title: `${complaintType} issue in ${complaintLocation}`,
        description: complaintDescription,
        category: complaintType,
        anonymous,
      }).unwrap();

      setSubmitSuccess(true);
      await refetch();

      // Reset form after success
      setTimeout(() => {
        setShowNewComplaint(false);
        setSubmitSuccess(false);
        setComplaintType('');
        setComplaintLocation('');
        setComplaintDescription('');
        setAnonymous(false);
      }, 2000);
    } catch (error) {
      alert(error?.data?.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Loading / Error states ───────────────────────────────────
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#AAC0E1] border-t-[#0E2F76] rounded-full animate-spin" />
            <p className="text-[#0E2F76]/60 text-sm font-inter">Loading complaints...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-inter">Failed to load complaints. Please try again.</p>
            <button
              onClick={refetch}
              className="mt-4 px-6 py-2 bg-[#0E2F76] text-white rounded-[12px] text-sm font-medium hover:bg-[#0a2560] transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ─── Render ────────────────────────────────────────────────────
  return (
    <MainLayout>
      <FloatingShapes />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0E2F76] font-inter">
                Complaints
              </h1>
              <p className="text-[#0E2F76]/50 text-sm font-inter mt-1">
                Report issues in your room or bathroom
              </p>
            </div>
            <button
              onClick={() => setShowNewComplaint(true)}
              className="w-11 h-11 bg-[#0E2F76] rounded-full flex items-center justify-center shadow-lg shadow-[#0E2F76]/20 hover:bg-[#0a2560] transition-all duration-300 active:scale-95"
            >
              <Plus size={22} className="text-white" strokeWidth={2} />
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAC0E1]" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-[16px] border border-[#AAC0E1]/30 focus:border-[#0E2F76] focus:ring-2 focus:ring-[#0E2F76]/10 outline-none transition-all duration-300 text-[#0E2F76] placeholder-[#AAC0E1] text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-11 h-11 flex items-center justify-center rounded-full border transition-all duration-300 ${
                showFilters
                  ? 'bg-[#0E2F76] border-[#0E2F76]'
                  : 'bg-white border-[#AAC0E1]/30'
              }`}
            >
              <Filter size={18} className={showFilters ? 'text-white' : 'text-[#AAC0E1]'} />
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="bg-white rounded-[20px] p-4 mb-4 shadow-sm border border-[#AAC0E1]/20 animate-[slideIn_0.3s_ease-out]">
              <div className="mb-4">
                <label className="text-xs font-semibold text-[#0E2F76] mb-2 block">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'pending', 'read', 'done'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                        filterStatus === status
                          ? 'bg-[#0E2F76] text-white'
                          : 'bg-[#AAC0E1]/10 text-[#0E2F76]/60 hover:bg-[#AAC0E1]/20'
                      }`}
                    >
                      {status === 'all' ? 'All' : getStatusDisplay(status)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0E2F76] mb-2 block">
                  Issue Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {['all', ...complaintTypes.map(t => t.label)].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                        filterType === type
                          ? 'bg-[#0E2F76] text-white'
                          : 'bg-[#AAC0E1]/10 text-[#0E2F76]/60 hover:bg-[#AAC0E1]/20'
                      }`}
                    >
                      {type === 'all' ? 'All Types' : type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Complaints List */}
        <div className="px-6 pb-8">
          {filteredComplaints.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-[#0E2F76]/40 mb-2">
                {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''} found
              </p>

              {filteredComplaints.map((complaint) => {
                const typeDetails = getTypeDetails(complaint.category || 'General');
                const TypeIcon = typeDetails.icon;
                const statusDisplay = getStatusDisplay(complaint.status);
                const isAnonymous = complaint.anonymous;

                return (
                  <div
                    key={complaint._id}
                    onClick={() => navigate(`/complaints/${complaint._id}`)}
                    className="bg-white rounded-[20px] p-4 shadow-sm border border-[#AAC0E1]/20 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${typeDetails.bg} flex items-center justify-center`}>
                          <TypeIcon size={18} className={typeDetails.color} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-[#0E2F76]">
                            {complaint.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-[#0E2F76]/40">{complaint.category || 'General'}</span>
                            <span className="text-[#AAC0E1]">•</span>
                            <span className="text-xs text-[#0E2F76]/40">
                              {new Date(complaint.createdAt).toLocaleDateString()}
                            </span>
                            {isAnonymous && (
                              <>
                                <span className="text-[#AAC0E1]">•</span>
                                <EyeOff size={12} className="text-[#AAC0E1]" />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${getStatusColor(complaint.status)}`}>
                        {statusDisplay}
                      </span>
                    </div>

                    <p className="text-xs text-[#0E2F76]/60 mb-3 line-clamp-2">
                      {complaint.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#0E2F76]/40">
                          {isAnonymous ? 'Anonymous' : complaint.user?.fullName || 'User'}
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-[#AAC0E1]" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={40} className="text-[#AAC0E1]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0E2F76] mb-2">
                No Complaints Found
              </h3>
              <p className="text-sm text-[#0E2F76]/50 mb-6">
                {searchQuery || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'You haven\'t reported any issues yet'}
              </p>
              {!searchQuery && filterStatus === 'all' && filterType === 'all' && (
                <button
                  onClick={() => setShowNewComplaint(true)}
                  className="px-6 py-3 bg-[#0E2F76] text-white rounded-full text-sm font-medium hover:bg-[#0a2560] transition-all duration-300 inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Report an Issue
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── New Complaint Modal ────────────────────────────────── */}
      {showNewComplaint && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNewComplaint(false)} />
          <div className="relative bg-white rounded-t-[30px] w-full max-w-md max-h-[80vh] overflow-y-auto animate-[slideUp_0.3s_ease-out] shadow-2xl">
            <div className="p-6 pb-24">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#0E2F76]">Report an Issue</h2>
                <button
                  onClick={() => setShowNewComplaint(false)}
                  className="w-10 h-10 rounded-full bg-[#AAC0E1]/10 flex items-center justify-center hover:bg-[#AAC0E1]/20 transition-all duration-300"
                >
                  <X size={20} className="text-[#0E2F76]" />
                </button>
              </div>

              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} className="text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0E2F76] mb-2">
                    Complaint Submitted!
                  </h3>
                  <p className="text-[#0E2F76]/60 text-sm">
                    Your complaint has been submitted successfully. The hostel administration will review it shortly.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Location */}
                  <div className="mb-5">
                    <label className="text-sm font-semibold text-[#0E2F76] mb-3 block">
                      Where is the issue?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {complaintLocations.map(location => {
                        const isSelected = complaintLocation === location.label;
                        return (
                          <button
                            key={location.id}
                            type="button"
                            onClick={() => setComplaintLocation(location.label)}
                            className={`p-3 rounded-[16px] border transition-all duration-300 ${
                              isSelected
                                ? 'bg-[#0E2F76] border-[#0E2F76]'
                                : 'bg-white border-[#AAC0E1]/20 hover:border-[#0E2F76]/30'
                            }`}
                          >
                            <span className={`text-xs font-medium ${
                              isSelected ? 'text-white' : 'text-[#0E2F76]'
                            }`}>
                              {location.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Type */}
                  <div className="mb-5">
                    <label className="text-sm font-semibold text-[#0E2F76] mb-3 block">
                      Type of Issue
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {complaintTypes.map(type => {
                        const details = getTypeDetails(type.label);
                        const Icon = details.icon;
                        const isSelected = complaintType === type.label;
                        return (
                          <button
                            key={type.label}
                            type="button"
                            onClick={() => setComplaintType(type.label)}
                            className={`p-3 rounded-[16px] border transition-all duration-300 ${
                              isSelected
                                ? 'bg-[#0E2F76] border-[#0E2F76]'
                                : 'bg-white border-[#AAC0E1]/20 hover:border-[#0E2F76]/30'
                            }`}
                          >
                            <Icon
                              size={20}
                              className={`mx-auto mb-1 ${
                                isSelected ? 'text-white' : details.color
                              }`}
                            />
                            <span className={`text-xs font-medium ${
                              isSelected ? 'text-white' : 'text-[#0E2F76]'
                            }`}>
                              {type.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-[#0E2F76] mb-2 block">
                      Describe the Issue
                    </label>
                    <textarea
                      value={complaintDescription}
                      onChange={(e) => setComplaintDescription(e.target.value)}
                      placeholder="Please describe the problem in detail..."
                      rows={4}
                      className="w-full p-4 bg-white rounded-[16px] border border-[#AAC0E1]/30 focus:border-[#0E2F76] focus:ring-2 focus:ring-[#0E2F76]/10 outline-none transition-all duration-300 text-[#0E2F76] placeholder-[#AAC0E1] text-sm resize-none"
                    />
                  </div>

                  {/* Anonymous Toggle */}
                  <div className="mb-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                        className="w-5 h-5 rounded border-[#AAC0E1] text-[#0E2F76] focus:ring-[#0E2F76]"
                      />
                      <div>
                        <span className="text-sm font-medium text-[#0E2F76]">Post anonymously</span>
                        <p className="text-xs text-[#0E2F76]/50">Your name will be hidden from the public</p>
                      </div>
                    </label>
                  </div>

                  {/* Submit */}
                  <button
                    type="button"
                    onClick={handleSubmitComplaint}
                    disabled={!complaintType || !complaintLocation || !complaintDescription.trim() || isSubmitting}
                    className="w-full py-4 bg-[#0E2F76] text-white rounded-[16px] font-semibold text-sm hover:bg-[#0a2560] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Complaint'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Complaints;