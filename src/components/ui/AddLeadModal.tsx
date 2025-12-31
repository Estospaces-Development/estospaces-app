import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useProperties } from '../../contexts/PropertyContext';

interface Lead {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  propertyInterested: string;
  status: string;
  score: number;
  budget: string;
  lastContact: string;
}

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Omit<Lead, 'id'>) => void;
  existingLead?: Lead | null;
}

const AddLeadModal = ({
  isOpen,
  onClose,
  onSave,
  existingLead,
}: AddLeadModalProps) => {
  const { properties } = useProperties();
  const [formData, setFormData] = useState<Omit<Lead, 'id'>>({
    name: existingLead?.name || '',
    email: existingLead?.email || '',
    phone: existingLead?.phone || '',
    propertyInterested: existingLead?.propertyInterested || '',
    status: existingLead?.status || 'New Lead',
    score: existingLead?.score || 0,
    budget: existingLead?.budget || '',
    lastContact: existingLead?.lastContact || 'Just now',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingLead) {
      setFormData({
        name: existingLead.name,
        email: existingLead.email,
        phone: existingLead.phone || '',
        propertyInterested: existingLead.propertyInterested,
        status: existingLead.status,
        score: existingLead.score,
        budget: existingLead.budget,
        lastContact: existingLead.lastContact,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        propertyInterested: '',
        status: 'New Lead',
        score: 0,
        budget: '',
        lastContact: 'Just now',
      });
    }
  }, [existingLead, isOpen]);

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.propertyInterested.trim()) {
      newErrors.propertyInterested = 'Property interested is required';
    }
    if (formData.score < 0 || formData.score > 100) {
      newErrors.score = 'Score must be between 0 and 100';
    }
    if (!formData.budget.trim()) {
      newErrors.budget = 'Budget is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      setFormData({
        name: '',
        email: '',
        phone: '',
        propertyInterested: '',
        status: 'New Lead',
        score: 0,
        budget: '',
        lastContact: 'Just now',
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {existingLead ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter lead name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="New Lead">New Lead</option>
                <option value="In Progress">In Progress</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Interested *
              </label>
              {properties.length > 0 ? (
                <select
                  value={formData.propertyInterested}
                  onChange={(e) => handleInputChange('propertyInterested', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.propertyInterested ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a property</option>
                  {properties.map((property) => {
                    const displayText = property.address 
                      ? `${property.title} - ${property.address}${property.price ? ` (${property.price})` : ''}`
                      : property.price
                      ? `${property.title} (${property.price})`
                      : property.title;
                    return (
                      <option key={property.id} value={property.title}>
                        {displayText}
                      </option>
                    );
                  })}
                  {formData.propertyInterested && !properties.find(p => p.title === formData.propertyInterested) && (
                    <option value={formData.propertyInterested}>{formData.propertyInterested}</option>
                  )}
                </select>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.propertyInterested}
                    onChange={(e) => handleInputChange('propertyInterested', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.propertyInterested ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter property name (no properties available)"
                  />
                  <p className="text-xs text-gray-500">
                    No properties available. Please add properties first or enter manually.
                  </p>
                </div>
              )}
              {errors.propertyInterested && (
                <p className="text-red-500 text-xs mt-1">{errors.propertyInterested}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score (0-100) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => handleInputChange('score', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.score ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter score"
              />
              {errors.score && (
                <p className="text-red-500 text-xs mt-1">{errors.score}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget *
              </label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.budget ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., $2,500/mo"
              />
              {errors.budget && (
                <p className="text-red-500 text-xs mt-1">{errors.budget}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              {existingLead ? 'Update Lead' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;

