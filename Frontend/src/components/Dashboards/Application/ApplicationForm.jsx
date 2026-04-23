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
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Please choose a PDF file');

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
      submitData.append('file', selectedFile);

      const response = await fetch('http://localhost:8080/api/upload/upload', {
        method: 'POST',
        body: submitData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Server error ${response.status}: ${errBody}`);
      }

      alert('✅ Application submitted successfully!');
      setFormData({
        conferenceName: '', conferenceAcronym: '', coreRanking: '',
        startDate: '', endDate: '', paperTitle: '',
        author: '', grantAmountRequested: '', justification: ''
      });
      setSelectedFile(null);

    } catch (err) {
      console.error('Submission error:', err);
      alert(`❌ Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
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
            Conference Travel Grant
          </h2>

          {/* ===== Conference Details ===== */}
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

          {/* ===== Paper Details ===== */}
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

            {/* ===== Gmail-style PDF Upload ===== */}
            <div className="mb-6">
              <label className="block font-bold text-blue-700 mb-2">Upload Paper PDF *</label>

              {!selectedFile ? (
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 
                                   border border-gray-300 rounded-lg hover:bg-gray-200 transition w-fit">
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor"
                    strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-sm text-gray-600 font-medium">Attach PDF</span>
                </label>
              ) : (
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 border border-gray-300 
                                rounded-lg w-fit max-w-sm">

                  {/* PDF Icon */}
                  <div className="flex items-center justify-center w-7 h-7 bg-red-100 rounded flex-shrink-0">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Clickable filename */}
                  <div className="flex flex-col min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        const url = URL.createObjectURL(selectedFile);
                        window.open(url, '_blank');
                      }}
                      className="text-sm font-medium text-blue-600 hover:underline text-left truncate max-w-[200px]"
                      title="Click to preview PDF"
                    >
                      {selectedFile.name}
                    </button>
                    <span className="text-xs text-gray-400">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </div>

                  {/* X remove button */}
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-1"
                    title="Remove"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
                      strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ===== Grant Details ===== */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">Grant Request</h3>

            <div className="mb-6">
              <label className="font-bold text-lg text-blue-700 block mb-2">Grant Amount Requested (₹) *</label>
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
            className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 
                       hover:to-blue-600 text-white rounded-xl font-bold text-xl shadow-lg transition-colors 
                       tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
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