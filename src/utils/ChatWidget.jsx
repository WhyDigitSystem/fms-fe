import { useState, useRef, useEffect } from "react";
import { 
  MessageCircle, X, Send, Bot, User, Maximize2, Minimize2, 
  Mic, MicOff, Paperclip, Download, ThumbsUp, ThumbsDown,
  Sparkles, Zap, Clock, BookOpen, Search, HelpCircle
} from "lucide-react";

// Helper functions for localStorage with expiration
const storageHelpers = {
  setItem(key, value, days = 7) {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + (days * 24 * 60 * 60 * 1000),
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  getItem(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  },

  removeItem(key) {
    localStorage.removeItem(key);
  }
};

// Quick action suggestions
const QUICK_ACTIONS = [
  "List all employees and their warehouses",
  "What is GRN?",
  "Show warehouse documentation",
  "Explain VAS process",
  "Employee count by warehouse"
];

// Voice recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(!!recognition);
  const [feedback, setFeedback] = useState({});
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const messagesEndRef = useRef(null);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = storageHelpers.getItem('chatWidgetMessages');
    if (savedMessages && savedMessages.length > 0) {
      const messagesWithDates = savedMessages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(messagesWithDates);
    } else {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm your AI Assistant. I can help you with:\n\n• Employee and warehouse data\n• Documentation and processes\n• GRN, VAS, and other workflows\n\nTry asking me about employees, warehouses, or use the quick actions below!",
          isUser: false,
          timestamp: new Date(),
          isStreamed: true // Mark as already streamed
        },
      ]);
    }

    // Load feedback from localStorage
    const savedFeedback = storageHelpers.getItem('chatFeedback');
    if (savedFeedback) {
      setFeedback(savedFeedback);
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      storageHelpers.setItem('chatWidgetMessages', messages, 7);
    }
  }, [messages]);

  // Save feedback to localStorage
  useEffect(() => {
    if (Object.keys(feedback).length > 0) {
      storageHelpers.setItem('chatFeedback', feedback, 30);
    }
  }, [feedback]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, typingIndicator, streamingMessage]);

  // Voice recognition handlers
  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      addSystemMessage("Voice input failed. Please try typing instead.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }, []);

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      setIsListening(false);
      recognition.stop();
    }
  };

  const addSystemMessage = (text) => {
    const systemMessage = {
      id: Date.now(),
      text,
      isUser: false,
      isSystem: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  // Simulate streaming text like ChatGPT
  const streamText = (fullText, messageId, type, data) => {
    return new Promise((resolve) => {
      const words = fullText.split(' ');
      let currentText = '';
      let index = 0;

      const streamInterval = setInterval(() => {
        if (index < words.length) {
          currentText += (index === 0 ? '' : ' ') + words[index];
          setStreamingMessage({
            id: messageId,
            text: currentText,
            isUser: false,
            timestamp: new Date(),
            type,
            data,
            messageId: `msg_${messageId}`,
            isStreaming: true
          });
          index++;
        } else {
          clearInterval(streamInterval);
          // Finalize the message
          setStreamingMessage(null);
          const finalMessage = {
            id: messageId,
            text: fullText,
            isUser: false,
            timestamp: new Date(),
            type,
            data,
            messageId: `msg_${messageId}`,
            isStreamed: true
          };
          setMessages(prev => [...prev, finalMessage]);
          resolve();
        }
      }, 40); // Adjust speed here (lower = faster)
    });
  };

  // API call to get AI response
  const getAIResponse = async (userMessage) => {
    try {
      const response = await fetch("http://139.5.190.244:6001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage,
          top_k: 10,
          use_summary: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.type === "table" && data.data && data.data.length > 0) {
        return {
          text: formatTableResponse(data),
          type: "table",
          data: data
        };
      } else if (data.type === "text" && data.content) {
        return {
          text: formatTextResponse(data),
          type: "text",
          data: data
        };
      } else if (data.summary) {
        return {
          text: data.summary,
          type: "summary",
          data: data
        };
      } else if (data.sql) {
        return {
          text: `I found this information for you:\n\n${data.summary || "Query executed successfully."}`,
          type: "sql",
          data: data
        };
      } else {
        return {
          text: "I received your query but couldn't find specific data. Could you please rephrase your question?",
          type: "unknown",
          data: data
        };
      }
    } catch (error) {
      console.error("API Error:", error);
      return {
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        type: "error",
        data: null
      };
    }
  };

  // Format table response
  const formatTableResponse = (data) => {
    let response = `📊 ${data.summary}\n\n`;
    
    if (data.data && data.data.length > 0) {
      if (data.columns.includes('name') && data.columns.includes('warehouse')) {
        const employees = {};
        data.data.forEach(item => {
          if (!employees[item.name]) {
            employees[item.name] = [];
          }
          employees[item.name].push(item.warehouse);
        });
        
        response += "**Employees and Their Warehouses:**\n\n";
        Object.keys(employees).forEach(employee => {
          response += `👤 **${employee}**: ${employees[employee].join(', ')}\n`;
        });
      } else {
        response += "**Data Summary:**\n\n";
        data.data.slice(0, 6).forEach((item, index) => {
          const entries = Object.entries(item);
          response += `${index + 1}. ${entries.map(([key, value]) => `**${key}**: ${value}`).join(' • ')}\n`;
        });
        
        if (data.data.length > 6) {
          response += `\n... and ${data.data.length - 6} more records`;
        }
      }
    }
    
    return response;
  };

  // Format text/document response
  const formatTextResponse = (data) => {
    if (data.intent === "DOC") {
      let response = "📄 **Documentation Information**\n\n";
      
      const cleanContent = data.content
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.trim())
        .join('\n');

      const sections = cleanContent.split('---');
      
      sections.forEach(section => {
        if (section.trim()) {
          const lines = section.split('\n').filter(line => line.trim());
          let title = '';
          let content = '';
          
          if (lines[0] && !lines[0].includes('Where to find this screen:')) {
            title = lines[0];
            content = lines.slice(1).join('\n');
          } else {
            content = lines.join('\n');
          }
          
          if (title) {
            response += `## ${title}\n\n`;
          }
          
          response += content.split('\n').map(line => {
            if (line.includes('Where to find this screen:')) {
              return `📍 **${line}**`;
            } else if (line.includes('Brief Description:')) {
              return `📝 **${line}**`;
            } else if (line.trim().startsWith('•') || line.trim().startsWith('')) {
              return `  • ${line.trim().replace(/^[•]\s*/, '')}`;
            } else if (/^\d+\./.test(line.trim())) {
              return `  ${line.trim()}`;
            } else if (line.trim()) {
              return line;
            }
            return '';
          }).filter(line => line).join('\n');
          
          response += '\n\n';
        }
      });
      
      return response;
    } else {
      return data.content;
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setShowQuickActions(false);
    setIsLoading(true);
    setTypingIndicator(true);

    try {
      const aiResponse = await getAIResponse(message);
      
      // Simulate typing delay before starting stream
      setTimeout(async () => {
        setTypingIndicator(false);
        const messageId = Date.now() + 1;
        await streamText(aiResponse.text, messageId, aiResponse.type, aiResponse.data);
      }, 800 + Math.random() * 400); // Random delay between 0.8-1.2 seconds

    } catch (error) {
      console.error("Error sending message:", error);
      setTypingIndicator(false);
      const errorResponse = {
        id: Date.now() + 1,
        text: "Sorry, there was an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
        type: "error",
        isStreamed: true
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    setMessage(action);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    setOpen(false);
    setIsMaximized(false);
  };

  const clearChat = () => {
    storageHelpers.removeItem('chatWidgetMessages');
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your AI Assistant. I can help you with:\n\n• Employee and warehouse data\n• Documentation and processes\n• GRN, VAS, and other workflows\n\nTry asking me about employees, warehouses, or use the quick actions below!",
        isUser: false,
        timestamp: new Date(),
        isStreamed: true
      },
    ]);
    setShowQuickActions(true);
    setStreamingMessage(null);
  };

  const handleFeedback = (messageId, isPositive) => {
    setFeedback(prev => ({
      ...prev,
      [messageId]: isPositive
    }));
    
    addSystemMessage(`Thank you for your feedback! ${isPositive ? '👍' : '👎'}`);
  };

  const exportChat = () => {
    const chatText = messages.map(msg => {
      const sender = msg.isUser ? "You" : "Assistant";
      const time = msg.timestamp.toLocaleString();
      return `[${time}] ${sender}: ${msg.text}`;
    }).join('\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addSystemMessage("Chat exported successfully!");
  };

  const getMessageDate = (timestamp) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    return messageDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Modify your useEffect that loads messages
useEffect(() => {
  const savedMessages = storageHelpers.getItem('chatWidgetMessages');
  const today = new Date().toDateString();
  const lastChatDate = storageHelpers.getItem('lastChatDate');
  
  // Clear messages if it's a new day
  if (lastChatDate !== today) {
    storageHelpers.removeItem('chatWidgetMessages');
    storageHelpers.setItem('lastChatDate', today, 1); // Store today's date
    setMessages([{
      id: 1,
      text: "Hello! I'm your AI Assistant. I can help you with:\n\n• Employee and warehouse data\n• Documentation and processes\n• GRN, VAS, and other workflows\n\nTry asking me about employees, warehouses, or use the quick actions below!",
      isUser: false,
      timestamp: new Date(),
      isStreamed: true
    }]);
  } else if (savedMessages && savedMessages.length > 0) {
    // Update timestamps to "today" when loading old messages
    const messagesWithUpdatedDates = savedMessages.map(msg => ({
      ...msg,
      timestamp: msg.isUser ? new Date(msg.timestamp) : new Date() // Keep user message times, update AI responses to now
    }));
    setMessages(messagesWithUpdatedDates);
  } else {
    setMessages([{
      id: 1,
      text: "Hello! I'm your AI Assistant. I can help you with:\n\n• Employee and warehouse data\n• Documentation and processes\n• GRN, VAS, and other workflows\n\nTry asking me about employees, warehouses, or use the quick actions below!",
      isUser: false,
      timestamp: new Date(),
      isStreamed: true
    }]);
  }

  // Load feedback from localStorage
  const savedFeedback = storageHelpers.getItem('chatFeedback');
  if (savedFeedback) {
    setFeedback(savedFeedback);
  }
}, []);

  const groupedMessages = () => {
    const groups = {};
    
    // Combine regular messages with streaming message if it exists
    const allMessages = streamingMessage 
      ? [...messages, streamingMessage]
      : messages;
    
    allMessages.forEach(message => {
      const date = getMessageDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  // Format message text with proper line breaks and markdown-like styling
  const formatMessageText = (text, isStreaming = false) => {
    return text.split('\n').map((line, index) => {
      if (line.trim() === '') {
        return <div key={index} className="h-3" />;
      }
      
      // Simple markdown-like formatting
      if (line.includes('**') && line.includes('**')) {
        const parts = line.split('**');
        return (
          <div key={index} className="mb-1">
            {parts.map((part, i) => 
              i % 2 === 1 ? (
                <strong key={i} className="font-semibold">{part}</strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
        );
      }
      
      // Handle bullet points and numbered lists
      if (line.trim().startsWith('•') || line.trim().startsWith('👤') || line.trim().startsWith('📊') || line.trim().startsWith('📄')) {
        return (
          <div key={index} className="flex mb-1">
            <span className="flex-shrink-0 mr-2">{line.charAt(0)}</span>
            <span>{line.slice(1).trim()}</span>
          </div>
        );
      }
      
      if (/^\d+\./.test(line.trim())) {
        return (
          <div key={index} className="flex mb-1">
            <span className="flex-shrink-0 mr-2">{line.split('.')[0]}.</span>
            <span>{line.split('.').slice(1).join('.').trim()}</span>
          </div>
        );
      }
      
      return (
        <div key={index} className="mb-1">
          {line}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
            fixed bottom-6 right-6 z-50
            bg-blue-600 hover:bg-blue-700 text-white 
            p-4 rounded-full shadow-2xl 
            transition-all duration-200 hover:scale-105
            flex items-center justify-center border border-blue-500
            dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700
            group
          "
        >
          <MessageCircle className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-10 right-0 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Assistant
          </div>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className={`
            fixed z-50 border rounded-xl shadow-2xl
            flex flex-col transition-all duration-200
            bg-white border-gray-200
            dark:bg-gray-900 dark:border-gray-700
            ${isMaximized 
              ? "inset-4 rounded-2xl" 
              : "bottom-6 right-6 w-[500px] h-[600px]"
            }
          `}
        >
          {/* Header */}
          <div className="
            border-b rounded-t-xl p-5 
            bg-gradient-to-r from-blue-600 to-purple-600 text-white
            dark:from-gray-800 dark:to-gray-700 dark:border-gray-700
          ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="
                  p-3 rounded-xl 
                  bg-white/20 backdrop-blur-sm
                  dark:bg-gray-700
                ">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    AI Assistant 
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">PRO</span>
                  </h2>
                  <p className="text-sm text-blue-100 dark:text-gray-300">
                    Live Streaming • Voice • Export
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportChat}
                  className="
                    p-2 rounded-lg transition-colors
                    hover:bg-white/20
                    dark:hover:bg-gray-700
                  "
                  title="Export Chat"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={clearChat}
                  className="
                    p-2 rounded-lg text-sm transition-colors
                    hover:bg-white/20
                    dark:hover:bg-gray-700
                  "
                >
                  Clear
                </button>
                <button
                  onClick={toggleMaximize}
                  className="
                    p-2 rounded-lg transition-colors
                    hover:bg-white/20
                    dark:hover:bg-gray-700
                  "
                >
                  {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleClose}
                  className="
                    p-2 rounded-lg transition-colors
                    hover:bg-white/20
                    dark:hover:bg-gray-700
                  "
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="
            flex-1 overflow-y-auto p-5 
            bg-gray-50
            dark:bg-gray-900
          ">
            <div className="space-y-6">
              {showQuickActions && messages.length <= 1 && (
                <div className="space-y-3">
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <Sparkles className="h-4 w-4 inline mr-1" />
                    Quick Actions
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {QUICK_ACTIONS.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action)}
                        className="
                          text-left p-3 rounded-lg border text-sm
                          bg-white hover:bg-gray-50 border-gray-200 text-gray-700
                          dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-300
                          transition-colors duration-200
                        "
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {Object.entries(groupedMessages()).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="flex items-center justify-center my-4">
                    <div className="
                      px-3 py-1 rounded-full text-xs font-medium
                      bg-gray-200 text-gray-600
                      dark:bg-gray-700 dark:text-gray-300
                    ">
                      {date}
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    {dateMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-4 ${msg.isUser ? "justify-end" : "justify-start"}`}
                      >
                        {!msg.isUser && !msg.isSystem && (
                          <div className="
                            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
                            bg-gradient-to-r from-blue-500 to-purple-500
                          ">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        )}
                        
                        {msg.isSystem && (
                          <div className="w-full text-center">
                            <div className="
                              inline-block px-3 py-2 rounded-lg text-xs
                              bg-yellow-100 text-yellow-800
                              dark:bg-yellow-900 dark:text-yellow-200
                            ">
                              <Zap className="h-3 w-3 inline mr-1" />
                              {msg.text}
                            </div>
                          </div>
                        )}
                        
                        {!msg.isSystem && (
                          <div
                            className={`
                              max-w-[85%] rounded-xl p-4 relative
                              ${msg.isUser
                                ? "bg-blue-500 text-white"
                                : "bg-white text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                              }
                            `}
                          >
                            <div className="text-sm whitespace-pre-line leading-relaxed">
                              {formatMessageText(msg.text, msg.isStreaming)}
                              
                              {/* Typing cursor for streaming messages */}
                              {msg.isStreaming && (
                                <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                              )}
                            </div>
                            <div className={`
                              text-xs mt-2 
                              ${msg.isUser 
                                ? "text-blue-200"
                                : "text-gray-500 dark:text-gray-400"
                              }
                            `}>
                              {msg.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            
                            {/* Feedback buttons for AI messages */}
                            {!msg.isUser && msg.messageId && !msg.isStreaming && (
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleFeedback(msg.messageId, true)}
                                  className={`p-1 rounded transition-colors ${
                                    feedback[msg.messageId] === true 
                                      ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                                      : "text-gray-400 hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                                  }`}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleFeedback(msg.messageId, false)}
                                  className={`p-1 rounded transition-colors ${
                                    feedback[msg.messageId] === false 
                                      ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                                      : "text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                                  }`}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {msg.isUser && (
                          <div className="
                            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
                            bg-gradient-to-r from-gray-600 to-gray-700
                          ">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {typingIndicator && (
                <div className="flex gap-4 justify-start">
                  <div className="
                    w-10 h-10 rounded-full flex items-center justify-center 
                    bg-gradient-to-r from-blue-500 to-purple-500
                  ">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="
                    max-w-[85%] rounded-xl p-4 border 
                    bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700
                  ">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      AI is thinking...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
      <div className="
  border-t rounded-b-xl p-4 
  bg-white border-gray-200
  dark:bg-gray-800 dark:border-gray-700
">
  <div className="flex gap-2">
    <div className="flex-1 relative">
      <textarea
    rows="1"
    placeholder="Ask about employees, warehouses, documentation..."
    value={message}
    onChange={(e) => {
      setMessage(e.target.value);
      // Auto-resize textarea
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
    }}
    onKeyDown={handleKeyPress}
    disabled={isLoading}
    className="
      w-full p-3 pr-24 rounded-xl border text-sm resize-none
      bg-white border-gray-300 text-gray-800 placeholder-gray-500
      dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
      disabled:opacity-50 transition-colors
      max-h-20
    "
  />
      
      {/* Input Actions */}
      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
        {isSpeechSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
            className={`
              p-1.5 rounded-lg transition-colors
              ${isListening 
                ? "text-red-500 bg-red-50 dark:bg-red-900/20" 
                : "text-gray-400 hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600"
              }
              disabled:opacity-50
            `}
            title={isListening ? "Stop listening" : "Voice input"}
          >
            {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          </button>
        )}
        
        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className="
            bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400
            dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-gray-600
            text-white p-1.5 rounded-lg 
            transition-colors duration-200 disabled:cursor-not-allowed
            flex items-center justify-center
          "
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>
  
  {/* Quick Tips - Compact Version */}
  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <HelpCircle className="h-3 w-3" />
        <span>Enter to send</span>
      </div>
      {isSpeechSupported && (
        <div className="flex items-center gap-1">
          <Mic className="h-3 w-3" />
          <span>Voice available</span>
        </div>
      )}
    </div>
    <div className="text-xs text-gray-400 dark:text-gray-500">
      {message.length}/500
    </div>
  </div>
</div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;