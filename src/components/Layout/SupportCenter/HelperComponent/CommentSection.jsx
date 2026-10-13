import React, { useEffect, useState } from 'react';
import { 
  Send, 
  MoreVertical, 
  Edit2, 
  Trash2,
  MessageCircle
} from 'lucide-react';
// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
// import relativeTime from 'dayjs/plugin/relativeTime';

// dayjs.extend(relativeTime);
// dayjs.extend(customParseFormat);

const CommentSection = ({ 
  commentsVO, 
  currentUser, 
  onSubmitComment, 
  onEditComment, 
  onDeleteComment 
}) => {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const transformed = commentsVO.map((c) => ({
      id: c.id,
      author: c.createdBy,
      text: c.comments,
      // createdAt: dayjs(c.commonDate?.createdon, 'DD-MM-YYYY hh:mm:ss a').fromNow()
    }));
    setComments(transformed);
  }, [commentsVO]);

  const handleMenuClick = (event, commentId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setShowMenu(showMenu === commentId ? null : commentId);
  };

  const handleSubmit = () => {
    if (editingCommentId) {
      onEditComment(comment, editingCommentId);
    } else {
      onSubmitComment(comment);
    }
    setComment('');
    setEditingCommentId(null);
  };

  const handleEditComment = (comment) => {
    setComment(comment.text);
    setEditingCommentId(comment.id);
    setShowMenu(null);
  };

  const handleDeleteComment = (comment) => {
    onDeleteComment(comment.id);
    setShowMenu(null);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <MessageCircle size={18} className="text-blue-500" />
        Comments
      </h4>

      {/* Comments List */}
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {comments.map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-l-4 border-orange-500 transition-all hover:shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {c.author?.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {c.author}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {c.createdAt}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                {c.text}
              </p>
            </div>

            {c.author === currentUser && (
              <div className="relative flex-shrink-0">
                <button
                  onClick={(e) => handleMenuClick(e, c.id)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <MoreVertical size={16} />
                </button>

                {showMenu === c.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(null)}
                    />
                    <div 
                      className="absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]"
                      style={{
                        top: menuPosition.top - window.scrollY,
                        left: menuPosition.left - 100
                      }}
                    >
                      <button
                        onClick={() => handleEditComment(c)}
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(c)}
                        className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      {/* Comment Input */}
      <div className="flex items-start gap-2 pt-2">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={editingCommentId ? 'Edit your comment...' : 'Write a comment...'}
          rows={2}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!comment.trim()}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
        >
          <Send size={16} />
          {editingCommentId ? 'Update' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default CommentSection;