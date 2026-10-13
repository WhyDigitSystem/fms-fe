const TabComponent = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div
      className="flex flex-wrap border-b dark:border-gray-700
                 bg-white/70 dark:bg-gray-800 backdrop-blur-md rounded-t-xl 
                 transition-colors duration-300"
    >
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => setActiveTab(index)}
          className={`
            relative py-3 px-5 font-medium text-sm transition-all duration-300
            ${
              activeTab === index
                ? "text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-500 dark:after:bg-blue-400"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabComponent;
