import React, { useState, useEffect } from 'react';
import { X, Loader2, Home, User, Briefcase, DollarSign, Calendar, Phone, Mail, Building2, FileText, CheckCircle, Search } from 'lucide-react';
import { supabase, isSupabaseAvailable } from '../../../lib/supabase';
import { useApplications } from '../../../contexts/ApplicationsContext';
import { useAuth } from '../../../contexts/AuthContext';

const NewApplicationModal = ({ isOpen, onClose, preSelectedProperty = null }) => {
  const { createApplication } = useApplications();
  const { user, profile } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Property selection
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(preSelectedProperty);
  
  // Form data
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: profile?.full_name || '',
    email: user?.email || profile?.email || '',
    phone: profile?.phone || '',
    
    // Employment
    employmentStatus: 'employed',
    employer: '',
    jobTitle: '',
    annualIncome: '',
    
    // Rental/Purchase specific
    moveInDate: '',
    notes: '',
  });

  // Fetch properties for selection
  useEffect(() => {
    const fetchProperties = async () => {
      if (!isSupabaseAvailable() || !searchQuery.trim()) {
        setProperties([]);
        return;
      }

      setLoadingProperties(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, address_line_1, city, postcode, price, property_type, listing_type, image_urls, contact_name, contact_email, contact_phone, company')
          .eq('status', 'online')
          .or(`title.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,postcode.ilike.%${searchQuery}%`)
          .limit(5);

        if (error) throw error;
        setProperties(data || []);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };

    const debounce = setTimeout(fetchProperties, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Pre-fill user data from profile
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.full_name || prev.fullName,
        email: profile.email || user?.email || prev.email,
        phone: profile.phone || prev.phone,
      }));
    }
  }, [profile, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setSearchQuery('');
    setProperties([]);
  };

  const handleSubmit = async () => {
    if (!selectedProperty) {
      setSubmitError('Please select a property');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let images = [];
      try {
        images = selectedProperty.image_urls 
          ? (Array.isArray(selectedProperty.image_urls) ? selectedProperty.image_urls : JSON.parse(selectedProperty.image_urls))
          : [];
      } catch (e) {
        images = [];
      }

      const applicationData = {
        property_id: selectedProperty.id,
        property_title: selectedProperty.title,
        property_address: selectedProperty.address_line_1 || `${selectedProperty.city || ''} ${selectedProperty.postcode || ''}`.trim(),
        property_price: selectedProperty.price,
        property_type: selectedProperty.property_type,
        listing_type: selectedProperty.listing_type,
        property_image: images[0] || null,
        agent_name: selectedProperty.contact_name,
        agent_email: selectedProperty.contact_email,
        agent_phone: selectedProperty.contact_phone,
        agent_company: selectedProperty.company,
        personal_info: {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        financial_info: {
          employment_status: formData.employmentStatus,
          employer: formData.employer,
          job_title: formData.jobTitle,
          annual_income: formData.annualIncome ? parseFloat(formData.annualIncome) : null,
        },
        move_in_date: formData.moveInDate || null,
        notes: formData.notes,
      };

      const result = await createApplication(applicationData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit application');
      }

      setSubmitSuccess(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
        setStep(1);
        setSelectedProperty(null);
      }, 2000);
    } catch (err) {
      console.error('Error submitting application:', err);
      setSubmitError(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              New Application
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Step {step} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    s === step
                      ? 'bg-orange-500 text-white'
                      : s < step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {s < step ? <CheckCircle size={16} /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 rounded ${s < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Property</span>
            <span>Your Details</span>
            <span>Review</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {submitSuccess ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Application Submitted!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your application has been sent. The agent will review and contact you soon.
              </p>
            </div>
          ) : (
            <>
              {/* Step 1: Property Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search for a Property
                    </label>
                    <div className="relative">
                      <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by property name, city, or postcode..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    {/* Property Search Results */}
                    {searchQuery && (
                      <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        {loadingProperties ? (
                          <div className="p-4 text-center text-gray-500">
                            <Loader2 size={20} className="animate-spin mx-auto" />
                          </div>
                        ) : properties.length > 0 ? (
                          properties.map((property) => {
                            let images = [];
                            try {
                              images = property.image_urls 
                                ? (Array.isArray(property.image_urls) ? property.image_urls : JSON.parse(property.image_urls))
                                : [];
                            } catch (e) {
                              images = [];
                            }
                            
                            return (
                              <button
                                key={property.id}
                                onClick={() => handlePropertySelect(property)}
                                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-b-0 border-gray-100 dark:border-gray-700 text-left"
                              >
                                <img
                                  src={images[0] || 'https://via.placeholder.com/60'}
                                  alt={property.title}
                                  className="w-14 h-14 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {property.title}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {property.address_line_1 || property.city}
                                  </p>
                                  <p className="text-sm font-medium text-orange-600">
                                    £{property.price?.toLocaleString()}
                                    {property.listing_type === 'rent' && '/month'}
                                  </p>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No properties found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Property */}
                  {selectedProperty && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-orange-800 dark:text-orange-300">Selected Property</span>
                        <button
                          onClick={() => setSelectedProperty(null)}
                          className="text-orange-600 hover:text-orange-700 text-sm"
                        >
                          Change
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        {(() => {
                          let images = [];
                          try {
                            images = selectedProperty.image_urls 
                              ? (Array.isArray(selectedProperty.image_urls) ? selectedProperty.image_urls : JSON.parse(selectedProperty.image_urls))
                              : [];
                          } catch (e) {
                            images = [];
                          }
                          return (
                            <img
                              src={images[0] || 'https://via.placeholder.com/80'}
                              alt={selectedProperty.title}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          );
                        })()}
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {selectedProperty.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedProperty.address_line_1 || `${selectedProperty.city || ''} ${selectedProperty.postcode || ''}`}
                          </p>
                          <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                            £{selectedProperty.price?.toLocaleString()}
                            {selectedProperty.listing_type === 'rent' && '/month'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Personal Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Preferred Move-in Date
                      </label>
                      <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          name="moveInDate"
                          value={formData.moveInDate}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200 dark:border-gray-700" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Employment Status
                      </label>
                      <select
                        name="employmentStatus"
                        value={formData.employmentStatus}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="employed">Employed</option>
                        <option value="self-employed">Self-employed</option>
                        <option value="unemployed">Unemployed</option>
                        <option value="student">Student</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Employer
                      </label>
                      <div className="relative">
                        <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="employer"
                          value={formData.employer}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Job Title
                      </label>
                      <div className="relative">
                        <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Annual Income (£)
                      </label>
                      <div className="relative">
                        <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          name="annualIncome"
                          value={formData.annualIncome}
                          onChange={handleInputChange}
                          placeholder="e.g. 45000"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Any additional information you'd like to share..."
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* Property Summary */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Home size={18} className="text-orange-500" />
                      Property
                    </h4>
                    <div className="flex items-center gap-4">
                      {selectedProperty && (() => {
                        let images = [];
                        try {
                          images = selectedProperty.image_urls 
                            ? (Array.isArray(selectedProperty.image_urls) ? selectedProperty.image_urls : JSON.parse(selectedProperty.image_urls))
                            : [];
                        } catch (e) {
                          images = [];
                        }
                        return (
                          <img
                            src={images[0] || 'https://via.placeholder.com/60'}
                            alt={selectedProperty?.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        );
                      })()}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedProperty?.title}</p>
                        <p className="text-sm text-gray-500">{selectedProperty?.address_line_1 || selectedProperty?.city}</p>
                        <p className="text-orange-600 font-medium">
                          £{selectedProperty?.price?.toLocaleString()}
                          {selectedProperty?.listing_type === 'rent' && '/month'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Info Summary */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <User size={18} className="text-orange-500" />
                      Your Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{formData.fullName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{formData.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{formData.phone || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Move-in:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{formData.moveInDate || 'Flexible'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Employment Summary */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Briefcase size={18} className="text-orange-500" />
                      Employment
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-2 text-gray-900 dark:text-white capitalize">{formData.employmentStatus}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Employer:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{formData.employer || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Job Title:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{formData.jobTitle || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Annual Income:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {formData.annualIncome ? `£${parseInt(formData.annualIncome).toLocaleString()}` : 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {formData.notes && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <FileText size={18} className="text-orange-500" />
                        Notes
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formData.notes}</p>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!submitSuccess && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !selectedProperty}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewApplicationModal;

