import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Wind
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import FloatingShapes from '../../components/common/FloatingShapes';

const Complaints = () => {
  const navigate = useNavigate();
  const [showNewComplaint, setShowNewComplaint] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // New complaint form state
  const [complaintType, setComplaintType] = useState('');
  const [complaintLocation, setComplaintLocation] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintImages, setComplaintImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Lock body scroll when modal is open
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

  // Demo complaints data
  const [complaints] = useState([
    {
      id: 1,
      type: 'Plumbing',
      location: 'Bathroom',
      title: 'Leaking Pipe in Bathroom',
      description: 'The pipe under the sink has been leaking for two days. Water is spreading across the bathroom floor and making it slippery.',
      status: 'In Progress',
      date: 'Jun 11, 2026',
      time: '10:30 AM',
      studentName: 'John Doe',
      studentId: 'STU/2024/001',
      hostelName: 'Hostel A',
      roomNumber: 'Room 3',
      bunkNumber: 'Bunk 2',
      images: 2,
    },
    {
      id: 2,
      type: 'Furniture',
      location: 'Room',
      title: 'Broken Study Chair',
      description: 'My study chair is broken. The backrest has come off completely and I cannot use it for studying.',
      status: 'Submitted',
      date: 'Jun 10, 2026',
      time: '02:15 PM',
      studentName: 'John Doe',
      studentId: 'STU/2024/001',
      hostelName: 'Hostel A',
      roomNumber: 'Room 3',
      bunkNumber: 'Bunk 2',
      images: 1,
    },
    {
      id: 3,
      type: 'Electrical',
      location: 'Room',
      title: 'Faulty Electrical Socket',
      description: 'The electrical socket near my bunk is not working. It sparks when I try to plug anything in. This is a safety hazard.',
      status: 'Resolved',
      date: 'Jun 8, 2026',
      time: '09:45 AM',
      studentName: 'John Doe',
      studentId: 'STU/2024/001',
      hostelName: 'Hostel A',
      roomNumber: 'Room 3',
      bunkNumber: 'Bunk 2',
      images: 0,
    },
    {
      id: 4,
      type: 'Cleaning',
      location: 'Bathroom',
      title: 'Bathroom Not Cleaned',
      description: 'The shared bathroom on our floor hasn\'t been cleaned for over a week. The floor is dirty and there\'s a bad smell.',
      status: 'Closed',
      date: 'Jun 5, 2026',
      time: '11:00 AM',
      studentName: 'John Doe',
      studentId: 'STU/2024/001',
      hostelName: 'Hostel A',
      roomNumber: 'Room 3',
      bunkNumber: 'Bunk 2',
      images: 0,
    },
    {
      id: 5,
      type: 'Plumbing',
      location: 'Toilet',
      title: 'Toilet Not Flushing',
      description: 'The toilet in our bathroom is not flushing properly. Water keeps running and it\'s wasting a lot of water.',
      status: 'Acknowledged',
      date: 'Jun 3, 2026',
      time: '08:00 AM',
      studentName: 'John Doe',
      studentId: 'STU/2024/001',
      hostelName: 'Hostel A',
      roomNumber: 'Room 3',
      bunkNumber: 'Bunk 2',
      images: 3,
    },
  ]);

  const complaintTypes = [
    { id: 'plumbing', label: 'Plumbing', icon: Droplets, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { id: 'electrical', label: 'Electrical', icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    { id: 'furniture', label: 'Furniture', icon: Armchair, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { id: 'cleaning', label: 'Cleaning', icon: Wind, color: 'text-green-500', bgColor: 'bg-green-50' },
    { id: 'painting', label: 'Painting', icon: PaintBucket, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { id: 'door-window', label: 'Door/Window', icon: DoorOpen, color: 'text-red-500', bgColor: 'bg-red-50' },
    { id: 'temperature', label: 'Temperature', icon: Thermometer, color: 'text-cyan-500', bgColor: 'bg-cyan-50' },
    { id: 'pest-control', label: 'Pest Control', icon: Bug, color: 'text-rose-500', bgColor: 'bg-rose-50' },
    { id: 'other', label: 'Other', icon: Wrench, color: 'text-gray-500', bgColor: 'bg-gray-50' },
  ];

  const complaintLocations = [
    { id: 'room', label: 'Room', icon: DoorOpen },
    { id: 'bathroom', label: 'Bathroom', icon: Bath },
    { id: 'toilet', label: 'Toilet', icon: Toilet },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Submitted': 'bg-yellow-50 text-yellow-600 border-yellow-200',
      'Acknowledged': 'bg-blue-50 text-blue-600 border-blue-200',
      'In Progress': 'bg-indigo-50 text-indigo-600 border-indigo-200',
      'Resolved': 'bg-green-50 text-green-600 border-green-200',
      'Closed': 'bg-gray-50 text-gray-600 border-gray-200',
    };
    return colors[status] || colors['Submitted'];
  };

  const getTypeDetails = (type) => {
    return complaintTypes.find(t => t.label === type) || complaintTypes[8];
  };

  const getLocationIcon = (location) => {
    const loc = complaintLocations.find(l => l.label === location);
    return loc ? loc.icon : DoorOpen;
  };

  // Filter and sort complaints
  const filteredComplaints = complaints
    .filter(complaint => {
      if (filterStatus !== 'all' && complaint.status !== filterStatus) return false;
      if (filterType !== 'all' && complaint.type !== filterType) return false;
      if (searchQuery && !complaint.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      return 0;
    });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setComplaintImages(prev => [...prev, ...newImages].slice(0, 5));
  };

  const removeImage = (id) => {
    setComplaintImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const handleSubmitComplaint = async () => {
    if (!complaintType || !complaintLocation || !complaintDescription.trim()) return;

    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setSubmitSuccess(true);
    setIsSubmitting(false);

    setTimeout(() => {
      setShowNewComplaint(false);
      setSubmitSuccess(false);
      setComplaintType('');
      setComplaintLocation('');
      setComplaintDescription('');
      setComplaintImages([]);
    }, 2000);
  };

  const statusFilters = ['all', 'Submitted', 'Acknowledged', 'In Progress', 'Resolved', 'Closed'];
  const typeFilters = ['all', 'Plumbing', 'Electrical', 'Furniture', 'Cleaning', 'Painting', 'Door/Window', 'Temperature', 'Pest Control', 'Other'];

  return (
    <MainLayout>
      <FloatingShapes />
      
      {/* Main Content */}
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
                  {statusFilters.map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                        filterStatus === status
                          ? 'bg-[#0E2F76] text-white'
                          : 'bg-[#AAC0E1]/10 text-[#0E2F76]/60 hover:bg-[#AAC0E1]/20'
                      }`}
                    >
                      {status === 'all' ? 'All' : status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0E2F76] mb-2 block">
                  Issue Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {typeFilters.map(type => (
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
                const typeDetails = getTypeDetails(complaint.type);
                const TypeIcon = typeDetails.icon;
                const LocationIcon = getLocationIcon(complaint.location);
                
                return (
                  <div
                    key={complaint.id}
                    onClick={() => navigate(`/complaints/${complaint.id}`)}
                    className="bg-white rounded-[20px] p-4 shadow-sm border border-[#AAC0E1]/20 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${typeDetails.bgColor} flex items-center justify-center`}>
                          <TypeIcon size={18} className={typeDetails.color} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-[#0E2F76]">
                            {complaint.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-1">
                              <LocationIcon size={12} className="text-[#AAC0E1]" />
                              <span className="text-xs text-[#0E2F76]/40">{complaint.location}</span>
                            </div>
                            <span className="text-[#AAC0E1]">•</span>
                            <span className="text-xs text-[#0E2F76]/40">{complaint.date}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                    
                    <p className="text-xs text-[#0E2F76]/60 mb-3 line-clamp-2">
                      {complaint.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#0E2F76]/40">{complaint.type}</span>
                        {complaint.images > 0 && (
                          <>
                            <span className="text-[#AAC0E1]">•</span>
                            <div className="flex items-center gap-1 text-xs text-[#0E2F76]/40">
                              <Camera size={12} />
                              {complaint.images} photo{complaint.images > 1 ? 's' : ''}
                            </div>
                          </>
                        )}
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

      {/* New Complaint Form Modal */}
      {showNewComplaint && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowNewComplaint(false)}
          />
          
          {/* Modal Content - Scrollable, sits above bottom nav */}
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
                /* Success State */
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
                /* Form */
                <div>
                  {/* Complaint Location */}
                  <div className="mb-5">
                    <label className="text-sm font-semibold text-[#0E2F76] mb-3 block">
                      Where is the issue?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {complaintLocations.map(location => {
                        const Icon = location.icon;
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
                            <Icon 
                              size={20} 
                              className={`mx-auto mb-1 ${
                                isSelected ? 'text-white' : 'text-[#0E2F76]'
                              }`} 
                            />
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

                  {/* Complaint Type */}
                  <div className="mb-5">
                    <label className="text-sm font-semibold text-[#0E2F76] mb-3 block">
                      Type of Issue
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {complaintTypes.map(type => {
                        const Icon = type.icon;
                        const isSelected = complaintType === type.label;
                        return (
                          <button
                            key={type.id}
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
                                isSelected ? 'text-white' : type.color
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
                  <div className="mb-5">
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

                  {/* Image Upload */}
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-[#0E2F76] mb-2 block">
                      Add Photos (Optional)
                    </label>
                    
                    {complaintImages.length > 0 && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {complaintImages.map(image => (
                          <div key={image.id} className="relative w-20 h-20 rounded-[12px] overflow-hidden">
                            <img 
                              src={image.preview} 
                              alt="Upload" 
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                            >
                              <X size={12} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {complaintImages.length < 5 && (
                      <label className="flex items-center gap-3 p-4 bg-[#AAC0E1]/10 rounded-[16px] border-2 border-dashed border-[#AAC0E1]/30 cursor-pointer hover:border-[#0E2F76]/30 transition-all duration-300">
                        <div className="w-10 h-10 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center">
                          <Camera size={18} className="text-[#0E2F76]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#0E2F76]">Add Photos</p>
                          <p className="text-xs text-[#0E2F76]/50">
                            {complaintImages.length}/5 photos (optional)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmitComplaint}
                    disabled={!complaintType || !complaintLocation || !complaintDescription.trim() || isSubmitting}
                    className="w-full py-4 bg-[#0E2F76] text-white rounded-[16px] font-semibold text-sm hover:bg-[#0a2560] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting Complaint...
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