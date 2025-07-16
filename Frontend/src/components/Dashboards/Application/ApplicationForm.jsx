import React, { useState } from 'react';
import axios from 'axios';

const ApplicationForm = () => {
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('No file chosen');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = document.querySelector('input[type="file"]').files[0];
    if (!file) return alert('Please choose a file');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    setIsSubmitting(true);

    try {
      const res = await axios.post('http://localhost:8080/api/upload/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, 
      });

      alert('✅ Application submitted!');
      setTitle('');
      setFileName('No file chosen');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || '❌ Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-blue-200"
      >
        <h2 className="text-3xl font-extrabold text-center mb-8 text-blue-700 tracking-tight drop-shadow">
          Applicant Form
        </h2>

        <div className="mb-8">
          <label className="font-bold text-lg text-blue-700 block mb-3">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="px-4 py-2 rounded-lg border border-gray-300 outline-none text-base w-full focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800 shadow-sm hover:border-blue-400 transition"
            placeholder="Enter a title..."
          />
        </div>

        <div className="mb-8">
          <label className="block font-bold text-blue-700 mb-3">Upload File</label>
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-white hover:bg-blue-50 transition">
            <svg
              className="w-14 h-14 text-blue-400 mb-4"
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
                accept="application/pdf,image/*"
                onChange={(e) => setFileName(e.target.files[0]?.name || 'No file chosen')}
                required
              />
              <span className="inline-block px-4 py-2 bg-blue-100 rounded border border-blue-300 font-medium hover:bg-blue-200 transition text-blue-700">
                Choose File
              </span>
              <span className="ml-2 text-gray-700 text-sm font-semibold">
                {isSubmitting ? 'Uploading...' : fileName}
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-bold text-xl shadow-lg transition-colors tracking-wide"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default ApplicationForm;
