import { useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCommunities } from '../hooks/useCommunities';
import type { CbtUpdateFormData, CbtFormSubmissionResponse } from '../types/index';

const ENGAGEMENT_TYPES = ['Visit', 'Phone', 'WhatsApp', 'Email', 'No contact'];
const CONTENT_TYPES = ['Instagram Post', 'Facebook Post', 'Story', 'Video', 'Blog Post', 'Other'];

export default function UpdateForm() {
  const navigate = useNavigate();
  const params = useParams<{ authority: string }>();
  const authority = params.authority || '';
  const { user } = useAuth();
  const { data: communities = [] } = useCommunities(authority);
  
  const [formData, setFormData] = useState<CbtUpdateFormData>({
    staffName: user?.name || user?.username || '',
    community: '',
    dateOfInteraction: new Date().toISOString().split('T')[0],
    engagementType: [],
    updateSummary: '',
    contentProduced: [],
    supportNeeded: '',
    nextPlannedVisit: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'engagementType' | 'contentProduced'
  ) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!formData.staffName.trim()) {
      setError('Staff name is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.community) {
      setError('Please select a community');
      setIsSubmitting(false);
      return;
    }

    if (formData.engagementType.length === 0) {
      setError('Please select at least one engagement type');
      setIsSubmitting(false);
      return;
    }

    if (!formData.updateSummary.trim()) {
      setError('Update summary is required');
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit to API endpoint
      const API_BASE = '/api';
      const response = await fetch(`${API_BASE}/cbt/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Submission failed' }));
        throw new Error(errorData.error || 'Failed to submit update');
      }

      const result: CbtFormSubmissionResponse = await response.json();
      
      if (result.success) {
        setSuccess(true);
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            staffName: formData.staffName, // Keep staff name
            community: '',
            dateOfInteraction: new Date().toISOString().split('T')[0],
            engagementType: [],
            updateSummary: '',
            contentProduced: [],
            supportNeeded: '',
            nextPlannedVisit: '',
          });
          setSuccess(false);
          // Optionally navigate back to dashboard
          // navigate('/');
        }, 2000);
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueCommunities = [...new Set(communities.map(c => c.community))].sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Submit CBT Update</h1>
            <p className="text-gray-600 mt-2">
              Record your community engagement activity and content production.
            </p>
          </div>
          <button
            onClick={() => navigate(`/${authority}`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 underline"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <div>
                <strong>Update submitted successfully!</strong>
                <p className="text-sm mt-1">Your update has been recorded. The dashboard will refresh shortly.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
          {/* Staff Name */}
          <div>
            <label htmlFor="staffName" className="block text-sm font-medium text-gray-700 mb-2">
              Staff Name *
            </label>
            <input
              type="text"
              id="staffName"
              name="staffName"
              value={formData.staffName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Auto-filled from your account</p>
          </div>

          {/* Community */}
          <div>
            <label htmlFor="community" className="block text-sm font-medium text-gray-700 mb-2">
              Community *
            </label>
            <select
              id="community"
              name="community"
              value={formData.community}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a community...</option>
              {uniqueCommunities.map(community => (
                <option key={community} value={community}>
                  {community}
                </option>
              ))}
            </select>
          </div>

          {/* Date of Interaction */}
          <div>
            <label htmlFor="dateOfInteraction" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Interaction *
            </label>
            <input
              type="date"
              id="dateOfInteraction"
              name="dateOfInteraction"
              value={formData.dateOfInteraction}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Engagement Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Engagement Type * (select all that apply)
            </label>
            <div className="space-y-2">
              {ENGAGEMENT_TYPES.map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={type}
                    checked={formData.engagementType.includes(type)}
                    onChange={(e) => handleCheckboxChange(e, 'engagementType')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Update Summary */}
          <div>
            <label htmlFor="updateSummary" className="block text-sm font-medium text-gray-700 mb-2">
              Update Summary *
            </label>
            <textarea
              id="updateSummary"
              name="updateSummary"
              value={formData.updateSummary}
              onChange={handleInputChange}
              rows={4}
              maxLength={500}
              placeholder="Brief summary of the interaction and any key outcomes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.updateSummary.length}/500 characters
            </p>
          </div>

          {/* Content Produced */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Produced (select all that apply)
            </label>
            <div className="space-y-2">
              {CONTENT_TYPES.map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={type}
                    checked={formData.contentProduced.includes(type)}
                    onChange={(e) => handleCheckboxChange(e, 'contentProduced')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Support Needed */}
          <div>
            <label htmlFor="supportNeeded" className="block text-sm font-medium text-gray-700 mb-2">
              Support Needed (optional)
            </label>
            <textarea
              id="supportNeeded"
              name="supportNeeded"
              value={formData.supportNeeded}
              onChange={handleInputChange}
              rows={3}
              placeholder="Describe any support or resources the community needs..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Next Planned Visit */}
          <div>
            <label htmlFor="nextPlannedVisit" className="block text-sm font-medium text-gray-700 mb-2">
              Next Planned Visit (optional)
            </label>
            <input
              type="date"
              id="nextPlannedVisit"
              name="nextPlannedVisit"
              value={formData.nextPlannedVisit}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Update'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/${authority}`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">💡 Quick Tips:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Fill out this form after each community interaction</li>
            <li>Select all engagement types that apply (e.g., both Visit and WhatsApp)</li>
            <li>Mark content produced even if it's scheduled for later publication</li>
            <li>Schedule next visit to help track follow-up activities</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

