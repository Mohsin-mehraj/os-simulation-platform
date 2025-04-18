// components/memory/Paging.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

const Paging = () => {
  // State for the simulation
  const [pageSize, setPageSize] = useState(1024); // in bytes
  const [virtualMemorySize, setVirtualMemorySize] = useState(16384); // 16 KB
  const [physicalMemorySize, setPhysicalMemorySize] = useState(8192); // 8 KB
  const [processes, setProcesses] = useState([]);
  const [nextProcessId, setNextProcessId] = useState(1);
  const [memoryAccesses, setMemoryAccesses] = useState([]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1000); // ms per step
  const [showTheory, setShowTheory] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("setup");

  // Derived state
  const numPages = Math.ceil(virtualMemorySize / pageSize);
  const numFrames = Math.floor(physicalMemorySize / pageSize);
  const simulationTimer = useRef(null);
  const pageTable = useRef(Array(numPages).fill(null));
  const physicalMemory = useRef(Array(numFrames).fill(null));
  const pageFaults = useRef(0);
  const pageHits = useRef(0);

  // Effect for controlling simulation
  useEffect(() => {
    if (simulationRunning && simulationStep < memoryAccesses.length) {
      simulationTimer.current = setTimeout(() => {
        setSimulationStep((prevStep) => prevStep + 1);
      }, simulationSpeed);
    } else if (simulationStep >= memoryAccesses.length) {
      setSimulationRunning(false);
    }

    return () => {
      if (simulationTimer.current) {
        clearTimeout(simulationTimer.current);
      }
    };
  }, [
    simulationRunning,
    simulationStep,
    memoryAccesses.length,
    simulationSpeed,
  ]);

  // Handle adding a new process
  const handleAddProcess = () => {
    if (processes.length >= 8) {
      setError("Maximum of 8 processes allowed for visualization");
      return;
    }

    const newProcess = {
      id: nextProcessId,
      name: `Process ${nextProcessId}`,
      size: 2048, // Default 2 KB
      color: getProcessColor(nextProcessId),
      accessPattern: "sequential", // Default pattern
    };

    setProcesses([...processes, newProcess]);
    setNextProcessId(nextProcessId + 1);
    setError(null);
  };

  // Handle removing a process
  const handleRemoveProcess = (processId) => {
    setProcesses(processes.filter((p) => p.id !== processId));
    setError(null);
  };

  // Handle changing process properties
  const handleProcessChange = (index, field, value) => {
    const updatedProcesses = [...processes];

    if (field === "size") {
      // Validate size
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue <= 0) {
        setError("Process size must be a positive number");
        return;
      }

      if (numValue > virtualMemorySize) {
        setError(
          `Process size cannot exceed virtual memory size (${virtualMemorySize} bytes)`
        );
        return;
      }

      updatedProcesses[index][field] = numValue;
    } else {
      updatedProcesses[index][field] = value;
    }

    setProcesses(updatedProcesses);
    setError(null);
  };

  // Reset simulation
  const resetSimulation = () => {
    setSimulationRunning(false);
    setSimulationStep(0);
    pageTable.current = Array(numPages).fill(null);
    physicalMemory.current = Array(numFrames).fill(null);
    pageFaults.current = 0;
    pageHits.current = 0;
    setError(null);
    setActiveTab("setup");
  };

  // Start simulation
  const startSimulation = () => {
    if (processes.length === 0) {
      setError("Add at least one process to simulate");
      return;
    }

    // Generate memory access patterns
    const accesses = generateMemoryAccesses();
    if (accesses.length === 0) {
      setError("Failed to generate memory accesses");
      return;
    }

    setMemoryAccesses(accesses);
    resetSimulation();
    setActiveTab("simulation");
    setSimulationRunning(true);
  };

  // Toggle simulation pause/play
  const toggleSimulation = () => {
    setSimulationRunning(!simulationRunning);
  };

  // Go to specific simulation step
  const goToStep = (step) => {
    if (step < 0) step = 0;
    if (step > memoryAccesses.length) step = memoryAccesses.length;

    setSimulationStep(step);

    // Recalculate state up to this step
    pageTable.current = Array(numPages).fill(null);
    physicalMemory.current = Array(numFrames).fill(null);
    pageFaults.current = 0;
    pageHits.current = 0;

    for (let i = 0; i < step; i++) {
      processMemoryAccess(memoryAccesses[i]);
    }
  };

  // Generate memory access patterns based on process settings
  const generateMemoryAccesses = () => {
    const accesses = [];

    processes.forEach((process) => {
      const numPages = Math.ceil(process.size / pageSize);
      const basePageIndex =
        accesses.length > 0
          ? Math.floor(
              Math.random() *
                (Math.ceil(virtualMemorySize / pageSize) - numPages)
            )
          : 0;

      // Generate different access patterns
      switch (process.accessPattern) {
        case "sequential":
          // Sequential access through all pages
          for (let i = 0; i < numPages; i++) {
            accesses.push({
              processId: process.id,
              virtualAddress: (basePageIndex + i) * pageSize,
              description: `${process.name} sequentially accesses page ${
                basePageIndex + i
              }`,
            });
          }
          break;

        case "random":
          // Random access to pages
          const numAccesses = Math.min(numPages * 2, 20); // Limit number of accesses
          for (let i = 0; i < numAccesses; i++) {
            const randomPage =
              basePageIndex + Math.floor(Math.random() * numPages);
            accesses.push({
              processId: process.id,
              virtualAddress: randomPage * pageSize,
              description: `${process.name} randomly accesses page ${randomPage}`,
            });
          }
          break;

        case "locality":
          // Temporal and spatial locality simulation
          const localityRegions = Math.min(3, numPages);
          const accessesPerRegion = 5;

          for (let region = 0; region < localityRegions; region++) {
            const regionStart =
              basePageIndex + Math.floor((region * numPages) / localityRegions);
            const regionEnd =
              basePageIndex +
              Math.floor(((region + 1) * numPages) / localityRegions) -
              1;

            for (let i = 0; i < accessesPerRegion; i++) {
              // Within each region, create a mix of sequential and repeated accesses
              let pageToAccess;
              if (i % 2 === 0) {
                // Repeated access (temporal locality)
                pageToAccess = regionStart;
              } else {
                // Sequential access within region (spatial locality)
                pageToAccess =
                  regionStart + (i % (regionEnd - regionStart + 1));
              }

              accesses.push({
                processId: process.id,
                virtualAddress: pageToAccess * pageSize,
                description: `${process.name} accesses page ${pageToAccess} (locality pattern)`,
              });
            }
          }
          break;

        default:
          // Default to sequential
          for (let i = 0; i < numPages; i++) {
            accesses.push({
              processId: process.id,
              virtualAddress: (basePageIndex + i) * pageSize,
              description: `${process.name} accesses page ${basePageIndex + i}`,
            });
          }
      }
    });

    return accesses;
  };

  // Process a memory access event
  const processMemoryAccess = (access) => {
    if (!access) return;

    const pageNumber = Math.floor(access.virtualAddress / pageSize);

    // Check if page is already in memory
    if (pageTable.current[pageNumber] !== null) {
      // Page hit
      pageHits.current++;
      return;
    }

    // Page fault - need to load the page
    pageFaults.current++;

    // Find a free frame or use page replacement
    let frameNumber = physicalMemory.current.findIndex(
      (frame) => frame === null
    );

    if (frameNumber === -1) {
      // No free frames - use FIFO replacement for simplicity
      frameNumber = pageFaults.current % numFrames;

      // Find which page was using this frame
      const replacedPageNumber = pageTable.current.findIndex(
        (frame) => frame === frameNumber
      );
      if (replacedPageNumber !== -1) {
        pageTable.current[replacedPageNumber] = null;
      }
    }

    // Assign frame to page
    pageTable.current[pageNumber] = frameNumber;

    // Update physical memory
    const process = processes.find((p) => p.id === access.processId);
    physicalMemory.current[frameNumber] = {
      processId: access.processId,
      pageNumber: pageNumber,
      color: process ? process.color : "#888888",
    };
  };

  // Get color for process visualization
  const getProcessColor = (id) => {
    const colors = [
      "#4299E1", // blue
      "#48BB78", // green
      "#ED8936", // orange
      "#9F7AEA", // purple
      "#F56565", // red
      "#38B2AC", // teal
      "#ED64A6", // pink
      "#ECC94B", // yellow
    ];

    return colors[(id - 1) % colors.length];
  };

  // Render current state of page table
  const renderPageTable = () => {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-100 p-3 font-medium text-slate-800 border-b">
          Page Table
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-3">
          {pageTable.current.map((frameNumber, pageNumber) => (
            <div
              key={pageNumber}
              className={`p-2 text-center border rounded-md ${
                frameNumber !== null
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="text-xs text-gray-500">Page {pageNumber}</div>
              <div className="font-medium">
                {frameNumber !== null ? `Frame ${frameNumber}` : "Not Loaded"}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render current state of physical memory
  const renderPhysicalMemory = () => {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-100 p-3 font-medium text-slate-800 border-b">
          Physical Memory (RAM)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3">
          {physicalMemory.current.map((data, frameNumber) => {
            const process = data
              ? processes.find((p) => p.id === data.processId)
              : null;

            return (
              <div
                key={frameNumber}
                className={`p-2 text-center border rounded-md ${
                  data !== null
                    ? "border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
                style={data ? { backgroundColor: `${data.color}20` } : {}}
              >
                <div className="text-xs text-gray-500">Frame {frameNumber}</div>
                {data ? (
                  <div className="font-medium flex items-center justify-center gap-1">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: data.color }}
                    ></span>
                    <span>{process ? process.name : `Process ?`}</span>
                    <span className="text-xs">Page {data.pageNumber}</span>
                  </div>
                ) : (
                  <div className="font-medium text-gray-400">Empty</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render memory access animation
  const renderMemoryAccessAnimation = () => {
    if (simulationStep === 0 || simulationStep > memoryAccesses.length) {
      return null;
    }

    const currentAccess = memoryAccesses[simulationStep - 1];
    const pageNumber = Math.floor(currentAccess.virtualAddress / pageSize);
    const frameNumber = pageTable.current[pageNumber];
    const process = processes.find((p) => p.id === currentAccess.processId);

    return (
      <div className="border rounded-lg overflow-hidden mb-6">
        <div className="bg-slate-100 p-3 font-medium text-slate-800 border-b">
          Current Memory Access (Step {simulationStep} of{" "}
          {memoryAccesses.length})
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{ backgroundColor: process ? process.color : "#888888" }}
            ></span>
            <span className="font-medium">{currentAccess.description}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-slate-700 mb-2">
                Virtual Address
              </div>
              <div className="flex items-center justify-center gap-1 text-center">
                <div className="bg-blue-100 p-2 rounded text-blue-800 font-mono">
                  Page: {pageNumber}
                </div>
                <div className="p-2">→</div>
                <div className="bg-green-100 p-2 rounded text-green-800 font-mono">
                  Offset: {currentAccess.virtualAddress % pageSize}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-slate-700 mb-2">
                Memory Access Result
              </div>
              <div className="text-center">
                {frameNumber !== null ? (
                  <div className="text-green-600 font-medium">Page Hit</div>
                ) : (
                  <div className="text-amber-600 font-medium">Page Fault</div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-slate-700 mb-2">
                Physical Address
              </div>
              {frameNumber !== null ? (
                <div className="flex items-center justify-center gap-1 text-center">
                  <div className="bg-purple-100 p-2 rounded text-purple-800 font-mono">
                    Frame: {frameNumber}
                  </div>
                  <div className="p-2">+</div>
                  <div className="bg-green-100 p-2 rounded text-green-800 font-mono">
                    Offset: {currentAccess.virtualAddress % pageSize}
                  </div>
                </div>
              ) : (
                <div className="text-center text-amber-600">
                  Page must be loaded into memory first
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render simulation statistics
  const renderStatistics = () => {
    if (simulationStep === 0) return null;

    const totalAccesses = simulationStep;
    const pageFaultRate = (pageFaults.current / totalAccesses) * 100;
    const pageHitRate = (pageHits.current / totalAccesses) * 100;

    return (
      <div className="border rounded-lg overflow-hidden mb-6">
        <div className="bg-slate-100 p-3 font-medium text-slate-800 border-b">
          Simulation Statistics
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-sm text-blue-700 mb-1">Total Accesses</div>
              <div className="text-xl font-bold text-blue-900">
                {totalAccesses}
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-sm text-green-700 mb-1">Page Hits</div>
              <div className="text-xl font-bold text-green-900">
                {pageHits.current}
              </div>
              <div className="text-xs text-green-600">
                {pageHitRate.toFixed(1)}%
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg text-center">
              <div className="text-sm text-amber-700 mb-1">Page Faults</div>
              <div className="text-xl font-bold text-amber-900">
                {pageFaults.current}
              </div>
              <div className="text-xs text-amber-600">
                {pageFaultRate.toFixed(1)}%
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <div className="text-sm text-purple-700 mb-1">
                Memory Utilization
              </div>
              <div className="text-xl font-bold text-purple-900">
                {Math.min(pageFaults.current, numFrames)} / {numFrames}
              </div>
              <div className="text-xs text-purple-600">
                {Math.min(
                  100,
                  (
                    (Math.min(pageFaults.current, numFrames) / numFrames) *
                    100
                  ).toFixed(1)
                )}
                %
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Paging - Memory Management Visualization
        </h1>

        <button
          onClick={() => setShowTheory(!showTheory)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <Info className="w-4 h-4" />
          {showTheory ? "Hide Theory" : "Show Theory"}
        </button>
      </div>

      {showTheory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            How Paging Works
          </h2>
          <div className="space-y-2 text-blue-900">
            <p>
              Paging is a memory management scheme that eliminates the need for
              contiguous memory allocation by dividing memory into fixed-size
              blocks.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                The logical (virtual) memory is divided into fixed-size units
                called <b>pages</b>.
              </li>
              <li>
                The physical memory (RAM) is divided into the same size units
                called <b>frames</b>.
              </li>
              <li>
                When a process needs memory, its pages are loaded into available
                frames in physical memory.
              </li>
              <li>
                A <b>page table</b> maintains the mapping between pages and
                frames.
              </li>
              <li>
                When the CPU generates a virtual address, it's converted to a
                physical address using the page table.
              </li>
              <li>
                A <b>page fault</b> occurs when a referenced page is not in
                memory and must be loaded from disk.
              </li>
            </ul>
            <p className="mt-2">
              In this visualization, you can create processes of different sizes
              and observe how their pages are loaded into physical memory frames
              as they're accessed.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="border-b border-slate-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("setup")}
            className={`px-4 py-2 ${
              activeTab === "setup"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-slate-600"
            }`}
          >
            Simulation Setup
          </button>
          <button
            onClick={() => setActiveTab("simulation")}
            className={`px-4 py-2 ${
              activeTab === "simulation"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-slate-600"
            }`}
            disabled={memoryAccesses.length === 0}
          >
            Simulation
          </button>
        </div>
      </div>

      {activeTab === "setup" ? (
        <div className="space-y-6">
          {/* Memory Configuration */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Memory Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Page Size (bytes)
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="512">512 bytes</option>
                  <option value="1024">1 KB (1024 bytes)</option>
                  <option value="2048">2 KB (2048 bytes)</option>
                  <option value="4096">4 KB (4096 bytes)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Virtual Memory Size
                </label>
                <select
                  value={virtualMemorySize}
                  onChange={(e) => setVirtualMemorySize(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="8192">8 KB</option>
                  <option value="16384">16 KB</option>
                  <option value="32768">32 KB</option>
                  <option value="65536">64 KB</option>
                </select>
                <div className="text-xs text-slate-500 mt-1">
                  Number of pages: {numPages}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Physical Memory Size
                </label>
                <select
                  value={physicalMemorySize}
                  onChange={(e) =>
                    setPhysicalMemorySize(Number(e.target.value))
                  }
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="4096">4 KB</option>
                  <option value="8192">8 KB</option>
                  <option value="16384">16 KB</option>
                  <option value="32768">32 KB</option>
                </select>
                <div className="text-xs text-slate-500 mt-1">
                  Number of frames: {numFrames}
                </div>
              </div>
            </div>
          </div>

          {/* Process Configuration */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Processes
              </h2>
              <button
                onClick={handleAddProcess}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                Add Process
              </button>
            </div>

            {processes.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                No processes added yet. Click "Add Process" to begin.
              </div>
            ) : (
              <div className="space-y-4">
                {processes.map((process, index) => (
                  <div
                    key={process.id}
                    className="p-4 border rounded-lg"
                    style={{ borderColor: process.color }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: process.color }}
                        ></div>
                        <h3 className="font-medium text-slate-800">
                          {process.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleRemoveProcess(process.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Process Name
                        </label>
                        <input
                          type="text"
                          value={process.name}
                          onChange={(e) =>
                            handleProcessChange(index, "name", e.target.value)
                          }
                          className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Size (bytes)
                        </label>
                        <input
                          type="number"
                          value={process.size}
                          onChange={(e) =>
                            handleProcessChange(index, "size", e.target.value)
                          }
                          className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="text-xs text-slate-500 mt-1">
                          Required pages: {Math.ceil(process.size / pageSize)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Access Pattern
                        </label>
                        <select
                          value={process.accessPattern}
                          onChange={(e) =>
                            handleProcessChange(
                              index,
                              "accessPattern",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="sequential">Sequential</option>
                          <option value="random">Random</option>
                          <option value="locality">Locality-based</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={startSimulation}
              disabled={processes.length === 0}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Start Simulation
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Simulation Controls */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={toggleSimulation}
                className={`px-4 py-2 rounded-lg text-white ${
                  simulationRunning
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {simulationRunning ? (
                  <div className="flex items-center gap-1">
                    <Pause className="w-4 h-4" /> Pause
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Play className="w-4 h-4" /> Play
                  </div>
                )}
              </button>

              <button
                onClick={resetSimulation}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-slate-700">Speed:</span>
                <select
                  value={simulationSpeed}
                  onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                  className="p-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="2000">Slow</option>
                  <option value="1000">Normal</option>
                  <option value="500">Fast</option>
                  <option value="100">Very Fast</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Step 0</span>
                <span>Step {memoryAccesses.length}</span>
              </div>
              <input
                type="range"
                min="0"
                max={memoryAccesses.length}
                value={simulationStep}
                onChange={(e) => goToStep(Number(e.target.value))}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="text-center text-sm text-slate-700 mt-1">
                Current Step: {simulationStep} / {memoryAccesses.length}
              </div>
            </div>
          </div>

          {/* Current Memory Access */}
          {renderMemoryAccessAnimation()}

          {/* Statistics */}
          {renderStatistics()}

          {/* Page Table Visualization */}
          {renderPageTable()}

          {/* Physical Memory Visualization */}
          <div className="mt-6">{renderPhysicalMemory()}</div>

          <div className="flex justify-end">
            <button
              onClick={() => setActiveTab("setup")}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Back to Setup
            </button>
          </div>
        </div>
      )}

      {/* AI Explanation Panel */}
      <div className="mt-8 bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Info className="w-5 h-5 text-blue-700" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Explanation</h2>
        </div>

        {simulationStep === 0 ? (
          <div className="prose prose-slate max-w-none">
            <p>
              Welcome to the Paging Memory Management simulation! This
              visualization will help you understand how paging works as a
              virtual memory management technique.
            </p>
            <p>
              <strong>How to use this simulation:</strong>
            </p>
            <ol>
              <li>
                Configure the page size, virtual memory size, and physical
                memory size
              </li>
              <li>
                Add processes of different sizes with various memory access
                patterns
              </li>
              <li>
                Start the simulation to see how pages are loaded into memory
                frames
              </li>
              <li>Observe page faults, page hits, and memory utilization</li>
            </ol>
            <p>
              <strong>Key concepts to watch for:</strong>
            </p>
            <ul>
              <li>
                <strong>Address Translation:</strong> How virtual addresses are
                converted to physical addresses
              </li>
              <li>
                <strong>Page Faults:</strong> What happens when a referenced
                page is not in memory
              </li>
              <li>
                <strong>Memory Utilization:</strong> How effectively the
                physical memory is being used
              </li>
              <li>
                <strong>Access Patterns:</strong> How different patterns affect
                page fault rates
              </li>
            </ul>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none">
            {simulationStep <= memoryAccesses.length ? (
              <>
                <p>
                  <strong>Current Situation:</strong>{" "}
                  {memoryAccesses[simulationStep - 1]?.description}
                </p>
                <p>
                  When a process accesses a memory location, the system needs to
                  translate the virtual address to a physical address. This
                  happens through the page table.
                </p>
                {pageTable.current[
                  Math.floor(
                    memoryAccesses[simulationStep - 1]?.virtualAddress /
                      pageSize
                  )
                ] === null ? (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <p>
                      <strong>Page Fault Detected:</strong> The requested page
                      is not currently in physical memory. The system needs to:
                    </p>
                    <ol>
                      <li>
                        Find an available frame in physical memory (or replace
                        an existing page)
                      </li>
                      <li>
                        Load the required page from disk (swap space or file
                        system)
                      </li>
                      <li>Update the page table to reflect the new mapping</li>
                      <li>
                        Restart the instruction that caused the page fault
                      </li>
                    </ol>
                    <p>
                      In a real system, page faults are expensive because they
                      require disk I/O, which is much slower than memory access.
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p>
                      <strong>Page Hit:</strong> The requested page is already
                      in physical memory.
                    </p>
                    <p>
                      The system can quickly translate the virtual address to a
                      physical address:
                    </p>
                    <ol>
                      <li>
                        Extract the page number and offset from the virtual
                        address
                      </li>
                      <li>Look up the frame number in the page table</li>
                      <li>
                        Combine the frame number with the offset to form the
                        physical address
                      </li>
                      <li>Access the data directly from physical memory</li>
                    </ol>
                  </div>
                )}

                <h3>Performance Analysis</h3>
                <p>
                  After {simulationStep} memory accesses, the page fault rate is
                  {((pageFaults.current / simulationStep) * 100).toFixed(1)}%.
                  {pageFaults.current / simulationStep > 0.5
                    ? " This high fault rate suggests that the working set of the processes exceeds the available physical memory."
                    : " This reasonable fault rate indicates that most frequently accessed pages fit in physical memory."}
                </p>

                <p>
                  {accessPatternsAnalysis(
                    processes,
                    simulationStep,
                    pageFaults.current
                  )}
                </p>
              </>
            ) : (
              <div>
                <p>
                  <strong>Simulation Complete!</strong>
                </p>
                <p>
                  This simulation has demonstrated how paging allows operating
                  systems to:
                </p>
                <ul>
                  <li>Allocate memory in fixed-size pages</li>
                  <li>Map virtual addresses to physical addresses</li>
                  <li>Handle page faults when needed pages aren't in memory</li>
                  <li>Implement virtual memory larger than physical memory</li>
                </ul>

                <h3>Final Performance Statistics</h3>
                <p>
                  Total Accesses: {memoryAccesses.length}
                  <br />
                  Page Hits: {pageHits.current} (
                  {((pageHits.current / memoryAccesses.length) * 100).toFixed(
                    1
                  )}
                  %)
                  <br />
                  Page Faults: {pageFaults.current} (
                  {((pageFaults.current / memoryAccesses.length) * 100).toFixed(
                    1
                  )}
                  %)
                </p>

                <p>
                  {finalSimulationAnalysis(
                    processes,
                    numPages,
                    numFrames,
                    pageFaults.current,
                    memoryAccesses.length
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to analyze access patterns
function accessPatternsAnalysis(processes, step, pageFaults) {
  if (processes.length === 0) return "";

  const patterns = processes.map((p) => p.accessPattern);

  if (patterns.includes("locality")) {
    return (
      "The locality-based access pattern demonstrates temporal and spatial locality principles. " +
      "Programs typically access memory locations that are close to recently accessed locations " +
      "(spatial locality) or repeatedly access the same locations (temporal locality)."
    );
  } else if (patterns.includes("random")) {
    return (
      "Random access patterns typically cause higher page fault rates because they lack locality. " +
      "This makes it difficult for the system to predict which pages will be needed next."
    );
  } else {
    return (
      "Sequential access patterns are generally more predictable, allowing for potentially " +
      "better performance through prefetching techniques."
    );
  }
}

// Helper function for final analysis
function finalSimulationAnalysis(
  processes,
  numPages,
  numFrames,
  pageFaults,
  totalAccesses
) {
  const pageFaultRate = pageFaults / totalAccesses;
  const memoryPressure =
    numPages > numFrames ? (numPages - numFrames) / numFrames : 0;

  if (pageFaultRate > 0.6) {
    return (
      "The high page fault rate indicates memory pressure. In a real system, this would " +
      "lead to thrashing, where the CPU spends more time handling page faults than executing instructions. " +
      "Solutions could include increasing physical memory, optimizing process memory usage, or " +
      "improving the page replacement algorithm."
    );
  } else if (pageFaultRate > 0.3) {
    return (
      "The moderate page fault rate suggests that while the system is functional, there's room " +
      "for optimization. Consider adjusting page sizes or implementing a more sophisticated page " +
      "replacement algorithm like LRU (Least Recently Used) instead of FIFO."
    );
  } else {
    return (
      "The low page fault rate indicates efficient memory management. The working set of the " +
      "processes fits well within physical memory, and the access patterns have good locality."
    );
  }
}

export default Paging;
