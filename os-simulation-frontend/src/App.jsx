import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Menu, X, Home } from "lucide-react";
import FCFS from "./components/FCFS";
import SJF from "./components/SJF";
import RR from "./components/RR";
import PS from "./components/PS";
import Documentation from "./components/Documentation";
import MLQ from "./components/MLQ";
import SRTF from "./components/SRTF";
import AlgorithmComparison from "./components/AlgorithmComparison";
import MemoryDocs from "./components/MemoryDocs";
import Paging from "./components/Paging";
import Segmentation from "./components/Segmentation";
import PageReplacement from "./components/PageReplacement";
import VirtualMemory from "./components/VirtualMemory";
import PageAllocation from "./components/PageAllocation";
import ProcessControlBlocks from "./components/ProcessControlBlock";

const App = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [openCategories, setOpenCategories] = useState([""]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      if (isSidebarOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen, isMobile]);

  const categories = [
    {
      id: "Documentaion",
      name: "Documentation",
      items: [
        {
          id: "docs",
          name: "CPU Scheduling Concepts",
          component: Documentation,
        },
        {
          id: "memory-docs",
          name: "Memory Management Concepts",
          component: MemoryDocs,
        },
      ],
    },

    {
      id: "scheduling",
      name: "CPU Scheduling Algorithms",
      items: [
        { id: "fcfs", name: "First Come First Serve (FCFS)", component: FCFS },
        { id: "sjf", name: "Shortest Job First (SJF)", component: SJF },
        {
          id: "srtf",
          name: "Shortest Remaining Time First (SRTF)",
          component: SRTF,
        },
        { id: "rr", name: "Round Robin (RR)", component: RR },
        { id: "ps", name: "Priority Scheduling (PS)", component: PS },
        { id: "mlq", name: "Multi-Level Queue (MLQ)", component: MLQ },
        {
          id: "ProcessControlBlock",
          name: "ProcessControlBlock",
          component: ProcessControlBlocks,
        },
      ],
    },

    {
      id: "CPU Scheduling Algorithms Comparison",
      name: "CPU Scheduling Algorithms Comparison",
      items: [
        {
          id: "compare",
          name: "Algorithm Comparison",
          component: AlgorithmComparison,
        },
      ],
    },
    {
      id: "memory",
      name: "Memory Management Concepts and Visualization",
      items: [
        { id: "paging", name: "Paging", component: Paging },
        { id: "segmentation", name: "Segmentation", component: Segmentation },
        {
          id: "PageReplacement",
          name: "PageReplacement",
          component: PageReplacement,
        },
        {
          id: "VirtualMemory",
          name: "VirtualMemory",
          component: VirtualMemory,
        },
        {
          id: "PageAllocation",
          name: "PageAllocation",
          component: PageAllocation,
        },
      ],
    },
  ];

  const toggleCategory = (categoryId) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleItemClick = (itemId) => {
    setSelectedItem(itemId);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const goHome = () => {
    setSelectedItem(null);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const renderSelectedComponent = () => {
    if (!selectedItem) return null;

    for (const category of categories) {
      const item = category.items.find((item) => item.id === selectedItem);
      if (item) {
        const Component = item.component;
        return <Component />;
      }
    }
    return null;
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Logo/Title Area - Only visible on desktop */}
      <div className="hidden lg:flex px-6 py-6 border-b border-slate-200 justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            OS Visualizer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Operating System Concepts
          </p>
        </div>
        {/* Home Button */}
        <button
          onClick={goHome}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Go to Home"
        >
          <Home className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Mobile Menu Header - Only visible on mobile */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h1 className="text-lg font-semibold text-slate-800">Menu</h1>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-3 py-6 overflow-y-auto">
        {categories.map((category) => (
          <div key={category.id} className="mb-4">
            <button
              onClick={() => toggleCategory(category.id)}
              className="flex items-center w-full p-7 text-left rounded-lg transition-all hover:bg-slate-50 group whitespace-normal"
            >
              <span className="flex items-center flex-1">
                <span className="shrink-0">
                  {openCategories.includes(category.id) ? (
                    <ChevronDown className="w-5 h-5 mr-3 text-slate-400 group-hover:text-slate-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 mr-3 text-slate-400 group-hover:text-slate-600" />
                  )}
                </span>
                <span className="break-normal font-medium text-slate-700 group-hover:text-slate-900">
                  {category.name}
                </span>
              </span>
            </button>

            {openCategories.includes(category.id) && (
              <div className="mt-2 ml-4 space-y-1">
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full px-4 py-3 text-left rounded-lg transition-all text-sm
                      ${
                        selectedItem === item.id
                          ? "bg-blue-500 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Header - Fixed at top */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center px-4 z-30">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6 text-slate-600" />
          ) : (
            <Menu className="w-6 h-6 text-slate-600" />
          )}
        </button>
        <div className="ml-4">
          <h1 className="text-lg font-semibold text-slate-800">
            OS Visualizer
          </h1>
        </div>
        {/* Home button in mobile header */}
        <button
          onClick={goHome}
          className="ml-auto p-2 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Go to home"
        >
          <Home className="w-5 h-5 text-slate-600" />
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "top-16" : "top-0"}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 mt-16"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen && !isMobile ? "lg:ml-72" : "lg:ml-72"
        } ${isMobile ? "mt-16" : ""}`}
      >
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {selectedItem ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6">
              {renderSelectedComponent()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
              <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-slate-200 max-w-lg w-full mx-4">
                <h2 className="text-xl lg:text-2xl font-semibold text-slate-800 mb-3">
                  Welcome to OS Concepts Visualizer
                </h2>
                <p className="text-slate-600">
                  Select a topic from the sidebar to explore operating system
                  concepts through interactive visualizations.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
