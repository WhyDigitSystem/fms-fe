import React, { useState } from 'react';
import { 
  Info, 
  FileText, 
  Image as ImageIcon, 
  Calendar,
  Download,
  X,
  Eye
} from 'lucide-react';
// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getStatusChip } from '../index';

// dayjs.extend(customParseFormat);

const TicketInfo = ({ selectedTicket }) => {
  const [open, setOpen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${selectedTicket.screenShot}`;
    link.download = `screenshot-${selectedTicket.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">ID</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTicket.id}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FileText size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Subject</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTicket.subject}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FileText size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Description</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTicket.description}</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Eye size={18} className="text-cyan-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                <div className="mt-1">{getStatusChip(selectedTicket.status)}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar size={18} className="text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Created On</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {/* {dayjs(selectedTicket.commonDate?.createdon, 'DD-MM-YYYY hh:mm:ss a').format('DD MMM YYYY')} */}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshot Section */}
        {selectedTicket.screenShot && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Attachment</span>
            <div className="relative group w-32 h-32">
              <img
                src={`data:image/png;base64,${selectedTicket.screenShot}`}
                alt="Screenshot"
                className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer group-hover:brightness-110 transition-all"
                onClick={() => setOpen(true)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Download"
              >
                <Download size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Image Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" onClick={() => setOpen(false)}>
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-90" />
            
            <div className="relative max-w-4xl max-h-[90vh]">
              <button
                onClick={() => setOpen(false)}
                className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white"
              >
                <X size={24} />
              </button>
              <img
                src={`data:image/png;base64,${selectedTicket.screenShot}`}
                alt="Full Screenshot"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketInfo;