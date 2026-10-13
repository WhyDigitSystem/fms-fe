import React from 'react';
import { Camera, Send, X, Loader2 } from 'lucide-react';

const RaiseTicketTab = ({ ticket, handleChange, handleSubmit, isLoading }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="space-y-4">
        {/* Subject Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="subject"
            value={ticket.subject}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
              ticket.errors.subject 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:border-orange-500'
            }`}
            placeholder="Enter ticket subject"
          />
          {ticket.errors.subject && (
            <p className="mt-1 text-xs text-red-500">Subject is required</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={ticket.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all resize-none ${
              ticket.errors.description 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:border-orange-500'
            }`}
            placeholder="Describe your issue in detail"
          />
          {ticket.errors.description && (
            <p className="mt-1 text-xs text-red-500">Description is required</p>
          )}
        </div>

        {/* File Upload Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <label className="relative inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer transition-colors text-sm font-medium">
              <Camera size={18} />
              Upload Screenshot
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>

            {/* File Preview */}
            {ticket.image && (
              <div className="mt-3 flex items-center gap-3">
                <div className="relative group">
                  <img
                    src={URL.createObjectURL(ticket.image)}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <button
                    onClick={() => handleChange({ target: { name: 'image', value: null } })}
                    className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    <X size={14} className="text-red-500" />
                  </button>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {ticket.image.name}
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {isLoading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaiseTicketTab;