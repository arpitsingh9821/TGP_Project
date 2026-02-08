import React, { useState } from 'react';

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    conferenceName: '',
    conferenceAcronym: '',
    coreRanking: '',
    startDate: '',
    endDate: '',
    paperTitle: '',
    author: '',
    grantAmountRequested: '',
    justification: ''
  });
  const [fileName, setFileName] = useState('No file chosen');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = document.querySelector('input[type="file"]').files[0];
    if (!file) return alert('Please choose a PDF file');

    const submitData = new FormData();
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    submitData.append('file', file);

    setIsSubmitting(true);

    try {
      // Replace with your actual API call
      const response = await fetch('http://localhost:8080/api/upload/upload', {
        method: 'POST',
        body: submitData,
        credentials: 'include'
      });

      if (response.ok) {
        alert('✅ Application submitted successfully!');
        
        // Reset form
        setFormData({
          conferenceName: '',
          conferenceAcronym: '',
          coreRanking: '',
          startDate: '',
          endDate: '',
          paperTitle: '',
          author: '',
          grantAmountRequested: '',
          justification: ''
        });
        setFileName('No file chosen');
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Application submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // Replace with your navigation logic
    window.history.back();
  };

  return (
    <div className="relative">
      <button 
        onClick={handleBack}
        className="absolute top-4 left-3 px-7 py-2 rounded-full text-white border-green-300 border-2 
              flex items-center text-xl gap-1 bg-gradient-to-r from-green-300 to-green-600 
              hover:border-green-100 hover:scale-110 transition-all duration-500 
              hover:shadow-[0_0_20px_5px_rgba(134,239,172,0.8)]">
        Back
      </button>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-2xl border border-blue-200">
          <h2 className="text-3xl font-extrabold text-center mb-8 text-blue-700 tracking-tight drop-shadow">
            Conference Grant Application
          </h2>

          {/* Conference Details Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">Conference Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="font-bold text-lg text-blue-700 block mb-2">Conference Name *</label>
                <input
                  type="text"
                  name="conferenceName"
                  value={formData.conferenceName}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 rounded-lg border border-gray-300 outline-none text-base w-full focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800 shadow-sm hover:border-blue-400 transition"
                  placeholder="e.g., International Conference on AI"
                />
              </div>

              <div>
                <label className="font-bold text-lg text-blue-700 block mb-2">Conference Acronym</label>
                <input
                  type="text"
                  name="conferenceAcronym"
                  value={formData.conferenceAcronym}
                  onChange={handleInputChange}
                  className="px-4 py-2 rounded-lg border border-gray-300 outline-none text-base w-full focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800 shadow-sm hover:border-blue-400 transition"
                  placeholder="e.g., ICAI"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="font-bold text-lg text-blue-700 block mb-2">CORE Ranking</label>
                <select
                  name="coreRanking"
                  value={formData.coreRanking}
                  onChange={handleInputChange}
                  className="px-4 py-2 rounded-lg border border-gray-300 outline-none text-base w-full focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800 shadow-sm hover:border-blue-400 transition"
                >
                  <option value="">Select Ranking</option>
                  <option value="A*">A*</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="Unranked">Unranked</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-lg text-blue-700 block mb-2">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 rounded-lg border border-gray-300 outline-none text-base w-full focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800 shadow-sm hover:border-blue-400 transition"
                />
              </div>

              <div>
                <label className="font-bold text-lg text-blue-700 block mb-2">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 rounded-lg border border-gray-300 outline-none text-base w-full focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800 shadow-sm hover:border-blue-400 transition"
                />
              </div>
            </div>
          </div>

          {/* Paper Details Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">Paper Details</h3>
            
            <div className="mb-6">
              <label className="font-bold text-lg text-blue-700 block mb-2">Paper Title *</label>
              <input
                type="text"
                name="paperTitle"
                value={formData.paperTitle}
                onChange={handleInputChange}
                required
                className="px-4 py-2 rounded-lg border border-gray-300 outline-none text-base w-full focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800 shadow-sm hover:border-blue-400 transition"
                placeholder="Enter your paper title..."
              />
            </div>

            <div className="mb-6">
              <label className="font-bold text-lg text-blue-700 block mb-2">Author(s) *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="px-4 py-2 rounded-lg border border-gray-300 outline-none text-base w-full focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800 shadow-sm hover:border-blue-400 transition"
                placeholder="e.g., John Doe, Jane Smith"
              />
            </div>

            <div className="mb-6">
              <label className="block font-bold text-blue-700 mb-2">Upload Paper PDF *</label>
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white hover:bg-blue-50 transition">
                <svg
                  className="w-12 h-12 text-blue-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
                <label className="cursor-pointer flex items-center justify-center gap-2">
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={(e) => setFileName(e.target.files[0]?.name || 'No file chosen')}
                    required
                  />
                  <span className="inline-block px-4 py-2 bg-blue-100 rounded border border-blue-300 font-medium hover:bg-blue-200 transition text-blue-700">
                    Choose PDF File
                  </span>
                  <span className="ml-2 text-gray-700 text-sm font-semibold">
                    {isSubmitting ? 'Uploading...' : fileName}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Grant Details Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">Grant Request</h3>
            
            <div className="mb-6">
              <label className="font-bold text-lg text-blue-700 block mb-2">Grant Amount Requested ($) *</label>
              <input
                type="number"
                name="grantAmountRequested"
                value={formData.grantAmountRequested}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="px-4 py-2 rounded-lg border border-gray-300 outline-none text-base w-full focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800 shadow-sm hover:border-blue-400 transition"
                placeholder="e.g., 2500.00"
              />
            </div>

            <div className="mb-6">
              <label className="font-bold text-lg text-blue-700 block mb-2">Justification *</label>
              <textarea
                name="justification"
                value={formData.justification}
                onChange={handleInputChange}
                required
                rows="4"
                className="px-4 py-2 rounded-lg border border-gray-300 outline-none text-base w-full focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800 shadow-sm hover:border-blue-400 transition resize-none"
                placeholder="Explain why you need this grant funding (travel expenses, accommodation, registration fees, etc.)..."
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-bold text-xl shadow-lg transition-colors tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;