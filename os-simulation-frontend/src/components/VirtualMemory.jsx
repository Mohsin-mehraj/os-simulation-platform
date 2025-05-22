import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Info,
  Cpu,
  Database,
  ArrowRight,
} from "lucide-react";

const VirtualMemory = () => {
  // Configuration state
  const [virtualMemorySize, setVirtualMemorySize] = useState(64); // in KB
  const [physicalMemorySize, setPhysicalMemorySize] = useState(32); // in KB
  const [pageSize, setPageSize] = useState(4); // in KB
  const [tlbSize, setTlbSize] = useState(4); // TLB entries
  const [showTheory, setShowTheory] = useState(true);
  const [activeTab, setActiveTab] = useState("setup");

  // Derived properties
  const virtualPages = Math.ceil(virtualMemorySize / pageSize);
  const physicalFrames = Math.floor(physicalMemorySize / pageSize);

  // Simulation state
  const [pageTable, setPageTable] = useState([]);
  const [tlb, setTlb] = useState([]); // Translation Lookaside Buffer
  const [physicalMemory, setPhysicalMemory] = useState([]);
  const [diskPages, setDiskPages] = useState([]);
  const [memoryAccesses, setMemoryAccesses] = useState([]);
  const [currentAccess, setCurrentAccess] = useState(null);
  const [accessHistory, setAccessHistory] = useState([]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1000);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pageFaults: 0,
    tlbHits: 0,
    totalAccesses: 0,
  });

  // Animation timer reference
  const simulationTimer = useRef(null);

  // Initialize structures when configuration changes
  useEffect(() => {
    initializeSimulation();
  }, [virtualPages, physicalFrames, pageSize, tlbSize]);

  // Run simulation steps based on timer
  useEffect(() => {
    if (simulationRunning && simulationStep < memoryAccesses.length) {
      simulationTimer.current = setTimeout(() => {
        simulateMemoryAccess();
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

  // Initialize simulation state
  const initializeSimulation = () => {
    // Create empty page table
    const newPageTable = Array(virtualPages)
      .fill()
      .map((_, i) => ({
        pageNumber: i,
        valid: false,
        frameNumber: null,
        referenced: false,
        modified: false,
        lastAccessed: 0,
      }));

    // Initialize physical memory (all frames empty)
    const newPhysicalMemory = Array(physicalFrames)
      .fill()
      .map((_, i) => ({
        frameNumber: i,
        pageNumber: null,
        data: `Frame ${i} Data`,
        lastUsed: 0,
      }));

    // Initialize disk pages (all virtual pages are initially on disk)
    const newDiskPages = Array(virtualPages)
      .fill()
      .map((_, i) => ({
        pageNumber: i,
        data: `Page ${i} Data`,
      }));

    // Empty TLB
    const newTlb = Array(tlbSize)
      .fill()
      .map((_, i) => ({
        valid: false,
        pageNumber: null,
        frameNumber: null,
        lastUsed: 0,
      }));

    // Generate random memory accesses
    const newMemoryAccesses = generateRandomAccesses(20, virtualPages);

    setPageTable(newPageTable);
    setPhysicalMemory(newPhysicalMemory);
    setDiskPages(newDiskPages);
    setTlb(newTlb);
    setMemoryAccesses(newMemoryAccesses);
    setAccessHistory([]);
    setCurrentAccess(null);
    setSimulationStep(0);
    setSimulationRunning(false);
    setStats({
      pageFaults: 0,
      tlbHits: 0,
      totalAccesses: 0,
    });
    setError(null);
  };

  // Generate random memory accesses with some locality of reference
  const generateRandomAccesses = (count, maxPage) => {
    const accesses = [];
    let localityCenter = Math.floor(Math.random() * maxPage);
    const localityWidth = Math.min(5, Math.floor(maxPage / 4));

    for (let i = 0; i < count; i++) {
      // Every 5 accesses, potentially shift locality center
      if (i % 5 === 0 && Math.random() < 0.3) {
        localityCenter = Math.floor(Math.random() * maxPage);
      }

      // 70% chance to access pages near locality center, 30% chance for random page
      let page;
      if (Math.random() < 0.7) {
        // Generate page near locality center
        const offset =
          Math.floor(Math.random() * (localityWidth * 2 + 1)) - localityWidth;
        page = Math.max(0, Math.min(maxPage - 1, localityCenter + offset));
      } else {
        // Generate random page
        page = Math.floor(Math.random() * maxPage);
      }

      // Generate random offset within page
      const offset = Math.floor(Math.random() * pageSize);

      // Calculate virtual address
      const virtualAddress = page * pageSize + offset;

      accesses.push({
        virtualAddress,
        pageNumber: page,
        offset,
        operation: Math.random() < 0.2 ? "write" : "read", // 20% writes, 80% reads
      });
    }

    return accesses;
  };

  // Simulate a memory access
  const simulateMemoryAccess = () => {
    if (simulationStep >= memoryAccesses.length) {
      setSimulationRunning(false);
      return;
    }

    const access = memoryAccesses[simulationStep];
    setCurrentAccess(access);

    // Clone current state for modifications
    const updatedPageTable = [...pageTable];
    const updatedPhysicalMemory = [...physicalMemory];
    const updatedTlb = [...tlb];
    const updatedStats = { ...stats };
    updatedStats.totalAccesses++;

    // Record the steps of address translation for visualization
    const steps = [];
    steps.push({
      step: "start",
      description: `Virtual address: ${access.virtualAddress} (Page ${access.pageNumber}, Offset ${access.offset})`,
    });

    // 1. Check TLB first (fast lookup)
    const tlbEntry = updatedTlb.find(
      (entry) => entry.valid && entry.pageNumber === access.pageNumber
    );

    if (tlbEntry) {
      // TLB Hit
      updatedStats.tlbHits++;
      steps.push({
        step: "tlb_hit",
        description: `TLB Hit! Found mapping for page ${access.pageNumber} to frame ${tlbEntry.frameNumber}`,
      });

      // Calculate physical address
      const physicalAddress = tlbEntry.frameNumber * pageSize + access.offset;

      // Update TLB entry's last used time
      tlbEntry.lastUsed = updatedStats.totalAccesses;

      // Update page table entry
      const pageEntry = updatedPageTable[access.pageNumber];
      pageEntry.referenced = true;
      pageEntry.lastAccessed = updatedStats.totalAccesses;
      if (access.operation === "write") {
        pageEntry.modified = true;
        steps.push({
          step: "write",
          description: `Write operation: Page ${access.pageNumber} marked as modified`,
        });
      }

      steps.push({
        step: "complete",
        description: `Memory access complete at physical address ${physicalAddress}`,
        physicalAddress,
        frameNumber: tlbEntry.frameNumber,
      });
    } else {
      // TLB Miss - check page table
      steps.push({
        step: "tlb_miss",
        description: `TLB Miss! Must check page table for page ${access.pageNumber}`,
      });

      const pageEntry = updatedPageTable[access.pageNumber];

      if (pageEntry.valid) {
        // Page is in memory
        steps.push({
          step: "page_hit",
          description: `Page table hit! Page ${access.pageNumber} is in frame ${pageEntry.frameNumber}`,
        });

        // Calculate physical address
        const physicalAddress =
          pageEntry.frameNumber * pageSize + access.offset;

        // Update page table entry
        pageEntry.referenced = true;
        pageEntry.lastAccessed = updatedStats.totalAccesses;
        if (access.operation === "write") {
          pageEntry.modified = true;
          steps.push({
            step: "write",
            description: `Write operation: Page ${access.pageNumber} marked as modified`,
          });
        }

        // Update TLB - replace least recently used entry
        const lruTlbIndex = updatedTlb
          .map((entry, index) => ({ index, lastUsed: entry.lastUsed }))
          .sort((a, b) => a.lastUsed - b.lastUsed)[0].index;

        updatedTlb[lruTlbIndex] = {
          valid: true,
          pageNumber: access.pageNumber,
          frameNumber: pageEntry.frameNumber,
          lastUsed: updatedStats.totalAccesses,
        };

        steps.push({
          step: "update_tlb",
          description: `Updated TLB with mapping: Page ${access.pageNumber} → Frame ${pageEntry.frameNumber}`,
        });

        steps.push({
          step: "complete",
          description: `Memory access complete at physical address ${physicalAddress}`,
          physicalAddress,
          frameNumber: pageEntry.frameNumber,
        });
      } else {
        // Page Fault - page is not in memory
        updatedStats.pageFaults++;
        steps.push({
          step: "page_fault",
          description: `Page Fault! Page ${access.pageNumber} is not in memory`,
        });

        // Find a free frame or select a victim frame
        let frameToUse;
        const emptyFrame = updatedPhysicalMemory.find(
          (frame) => frame.pageNumber === null
        );

        if (emptyFrame) {
          // Use an empty frame
          frameToUse = emptyFrame.frameNumber;
          steps.push({
            step: "allocate_frame",
            description: `Allocating empty frame ${frameToUse} for page ${access.pageNumber}`,
          });
        } else {
          // Need to evict a page - use LRU policy
          const victimFrame = updatedPhysicalMemory
            .map((frame, index) => ({
              frameNumber: frame.frameNumber,
              pageNumber: frame.pageNumber,
              lastAccessed: updatedPageTable[frame.pageNumber].lastAccessed,
            }))
            .sort((a, b) => a.lastAccessed - b.lastAccessed)[0];

          frameToUse = victimFrame.frameNumber;
          const victimPage = victimFrame.pageNumber;

          steps.push({
            step: "evict",
            description: `Evicting page ${victimPage} from frame ${frameToUse} (LRU replacement)`,
            victimPage,
            frameToUse,
          });

          // If the victim page was modified, it would need to be written back to disk
          if (updatedPageTable[victimPage].modified) {
            steps.push({
              step: "writeback",
              description: `Writing back modified page ${victimPage} to disk`,
              victimPage,
            });
          }

          // Update victim page's page table entry
          updatedPageTable[victimPage].valid = false;
          updatedPageTable[victimPage].frameNumber = null;

          // Remove any TLB entries for the victim page
          for (const entry of updatedTlb) {
            if (entry.valid && entry.pageNumber === victimPage) {
              entry.valid = false;
              entry.pageNumber = null;
              entry.frameNumber = null;
            }
          }
        }

        // Load page from disk to memory
        steps.push({
          step: "load",
          description: `Loading page ${access.pageNumber} from disk to frame ${frameToUse}`,
          pageNumber: access.pageNumber,
          frameToUse,
        });

        // Update page table
        updatedPageTable[access.pageNumber].valid = true;
        updatedPageTable[access.pageNumber].frameNumber = frameToUse;
        updatedPageTable[access.pageNumber].referenced = true;
        updatedPageTable[access.pageNumber].modified =
          access.operation === "write";
        updatedPageTable[access.pageNumber].lastAccessed =
          updatedStats.totalAccesses;

        // Update physical memory
        const frameIndex = updatedPhysicalMemory.findIndex(
          (frame) => frame.frameNumber === frameToUse
        );
        updatedPhysicalMemory[frameIndex] = {
          ...updatedPhysicalMemory[frameIndex],
          pageNumber: access.pageNumber,
          lastUsed: updatedStats.totalAccesses,
        };

        // Update TLB
        const lruTlbIndex = updatedTlb
          .map((entry, index) => ({ index, lastUsed: entry.lastUsed }))
          .sort((a, b) => a.lastUsed - b.lastUsed)[0].index;

        updatedTlb[lruTlbIndex] = {
          valid: true,
          pageNumber: access.pageNumber,
          frameNumber: frameToUse,
          lastUsed: updatedStats.totalAccesses,
        };

        steps.push({
          step: "update_tlb",
          description: `Updated TLB with mapping: Page ${access.pageNumber} → Frame ${frameToUse}`,
        });

        // Calculate physical address
        const physicalAddress = frameToUse * pageSize + access.offset;

        if (access.operation === "write") {
          steps.push({
            step: "write",
            description: `Write operation: Page ${access.pageNumber} marked as modified`,
          });
        }

        steps.push({
          step: "complete",
          description: `Memory access complete at physical address ${physicalAddress}`,
          physicalAddress,
          frameNumber: frameToUse,
        });
      }
    }

    // Update state
    setPageTable(updatedPageTable);
    setPhysicalMemory(updatedPhysicalMemory);
    setTlb(updatedTlb);
    setStats(updatedStats);
    setAccessHistory([...accessHistory, { access, steps }]);
    setSimulationStep(simulationStep + 1);
  };

  // Reset simulation
  const resetSimulation = () => {
    setSimulationRunning(false);
    initializeSimulation();
  };

  // Toggle simulation running state
  const toggleSimulation = () => {
    setSimulationRunning(!simulationRunning);
  };

  // Go to a specific step
  const goToStep = (step) => {
    if (step < 0) step = 0;
    if (step > memoryAccesses.length) step = memoryAccesses.length;

    // Reset simulation
    initializeSimulation();

    // Run simulation up to the specified step
    for (let i = 0; i < step; i++) {
      setSimulationStep(i);
      simulateMemoryAccess();
    }
  };

  // Generate memory access patterns
  const generateNewAccessPattern = () => {
    setMemoryAccesses(generateRandomAccesses(20, virtualPages));
    resetSimulation();
  };

  return (
    <div className="max-w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Virtual Memory Visualization
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
            Understanding Virtual Memory
          </h2>
          <div className="space-y-2 text-blue-900">
            <p>
              Virtual memory is a memory management technique that provides an
              idealized abstraction of the storage resources that are actually
              available on a given machine.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <b>Virtual Addresses</b>: Programs use virtual addresses which
                are translated to physical addresses by the CPU and memory
                management unit (MMU).
              </li>
              <li>
                <b>Paging</b>: Virtual memory is divided into fixed-size pages,
                and physical memory into frames of the same size.
              </li>
              <li>
                <b>Page Table</b>: A data structure that maps virtual pages to
                physical frames.
              </li>
              <li>
                <b>TLB (Translation Lookaside Buffer)</b>: A cache that stores
                recent address translations for faster lookup.
              </li>
              <li>
                <b>Page Fault</b>: Occurs when a program accesses a page that is
                not currently in physical memory and must be loaded from disk.
              </li>
            </ul>
            <p className="mt-2">
              This visualization demonstrates how virtual addresses are
              translated to physical addresses, including TLB lookups, page
              table accesses, and page faults.
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
            Configuration
          </button>
          <button
            onClick={() => setActiveTab("simulation")}
            className={`px-4 py-2 ${
              activeTab === "simulation"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-slate-600"
            }`}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Virtual Memory Size
                </label>
                <select
                  value={virtualMemorySize}
                  onChange={(e) => setVirtualMemorySize(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="32">32 KB</option>
                  <option value="64">64 KB</option>
                  <option value="128">128 KB</option>
                  <option value="256">256 KB</option>
                </select>
                <div className="text-xs text-slate-500 mt-1">
                  Number of pages: {virtualPages}
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
                  <option value="16">16 KB</option>
                  <option value="32">32 KB</option>
                  <option value="64">64 KB</option>
                  <option value="128">128 KB</option>
                </select>
                <div className="text-xs text-slate-500 mt-1">
                  Number of frames: {physicalFrames}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Page Size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">1 KB</option>
                  <option value="2">2 KB</option>
                  <option value="4">4 KB</option>
                  <option value="8">8 KB</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  TLB Size (entries)
                </label>
                <select
                  value={tlbSize}
                  onChange={(e) => setTlbSize(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="2">2 entries</option>
                  <option value="4">4 entries</option>
                  <option value="8">8 entries</option>
                  <option value="16">16 entries</option>
                </select>
              </div>
            </div>
          </div>

          {/* Memory Access Patterns */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Memory Access Pattern
              </h2>
              <button
                onClick={generateNewAccessPattern}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                Generate New Pattern
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Access #
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Virtual Address
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Page
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Offset
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Operation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {memoryAccesses.map((access, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-sm text-slate-800 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-600">
                        {access.virtualAddress}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-600">
                        {access.pageNumber}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-600">
                        {access.offset}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {access.operation === "read" ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            Read
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            Write
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                initializeSimulation();
                setActiveTab("simulation");
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
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

          {/* Current Access Visualization */}
          {currentAccess && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Current Memory Access
              </h2>

              <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Cpu className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-slate-700">CPU</div>
                    <div className="text-slate-500">
                      Generates virtual address
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-400 hidden md:block" />

                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <div className="font-mono font-bold text-purple-600">
                      TLB
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-slate-700">
                      Translation Lookaside Buffer
                    </div>
                    <div className="text-slate-500">Quick address cache</div>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-400 hidden md:block" />

                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <div className="font-mono font-bold text-green-600">PT</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-slate-700">Page Table</div>
                    <div className="text-slate-500">
                      Maps virtual pages to frames
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-400 hidden md:block" />

                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <Database className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-slate-700">
                      Physical Memory
                    </div>
                    <div className="text-slate-500">Stores actual data</div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="bg-slate-100 p-3 rounded-lg mb-2">
                  <div className="font-medium text-slate-800">
                    Virtual Address: {currentAccess.virtualAddress}
                  </div>
                  <div className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      Page: {currentAccess.pageNumber}
                    </span>
                    <span>+</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      Offset: {currentAccess.offset}
                    </span>
                    <span className="ml-4 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      {currentAccess.operation === "read" ? "Read" : "Write"}{" "}
                      Operation
                    </span>
                  </div>
                </div>

                {accessHistory.length > 0 &&
                  accessHistory[accessHistory.length - 1].steps && (
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 p-2 border-b border-slate-200 text-sm font-medium text-slate-700">
                        Address Translation Steps
                      </div>
                      <div className="p-3">
                        <ol className="space-y-3">
                          {accessHistory[accessHistory.length - 1].steps.map(
                            (step, index) => {
                              let bgColor = "bg-slate-50";
                              let textColor = "text-slate-800";

                              // Different styling based on step type
                              if (step.step === "tlb_hit") {
                                bgColor = "bg-green-50";
                                textColor = "text-green-700";
                              } else if (step.step === "tlb_miss") {
                                bgColor = "bg-amber-50";
                                textColor = "text-amber-700";
                              } else if (step.step === "page_fault") {
                                bgColor = "bg-red-50";
                                textColor = "text-red-700";
                              } else if (step.step === "complete") {
                                bgColor = "bg-blue-50";
                                textColor = "text-blue-700";
                              }

                              return (
                                <li
                                  key={index}
                                  className={`p-2 rounded-lg ${bgColor} ${textColor}`}
                                >
                                  {step.description}
                                </li>
                              );
                            }
                          )}
                        </ol>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Memory Structures Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TLB */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
                <span className="inline-block w-5 h-5 bg-purple-100 text-purple-600 text-xs font-bold rounded mr-2 flex items-center justify-center">
                  TLB
                </span>
                Translation Lookaside Buffer
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        Entry
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        Valid
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        Page Number
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        Frame Number
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        Last Used
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {tlb.map((entry, index) => (
                      <tr
                        key={index}
                        className={`${
                          currentAccess &&
                          tlb.find(
                            (e) =>
                              e.valid &&
                              e.pageNumber === currentAccess.pageNumber
                          ) === entry
                            ? "bg-purple-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-3 py-2 text-sm font-medium text-slate-700">
                          {index}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {entry.valid ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Valid
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                              Invalid
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600">
                          {entry.valid ? entry.pageNumber : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600">
                          {entry.valid ? entry.frameNumber : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600">
                          {entry.lastUsed > 0 ? entry.lastUsed : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Page Table */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
                <span className="inline-block w-5 h-5 bg-green-100 text-green-600 text-xs font-bold rounded mr-2 flex items-center justify-center">
                  PT
                </span>
                Page Table
              </h3>

              <div className="max-h-80 overflow-y-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        Page
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        Valid
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        Frame
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        Referenced
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        Modified
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pageTable.map((entry) => (
                      <tr
                        key={entry.pageNumber}
                        className={`${
                          currentAccess &&
                          entry.pageNumber === currentAccess.pageNumber
                            ? "bg-green-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-3 py-2 text-sm font-medium text-slate-700">
                          {entry.pageNumber}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {entry.valid ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Valid
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                              Invalid
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600">
                          {entry.frameNumber !== null ? entry.frameNumber : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {entry.referenced ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              Yes
                            </span>
                          ) : (
                            <span>No</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {entry.modified ? (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                              Yes
                            </span>
                          ) : (
                            <span>No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Physical Memory Visualization */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
              <span className="inline-block w-5 h-5 bg-amber-100 text-amber-600 text-xs font-bold rounded mr-2 flex items-center justify-center">
                <Database className="w-3 h-3" />
              </span>
              Physical Memory
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {physicalMemory.map((frame) => {
                const pageEntry =
                  frame.pageNumber !== null
                    ? pageTable.find((p) => p.pageNumber === frame.pageNumber)
                    : null;

                return (
                  <div
                    key={frame.frameNumber}
                    className={`p-3 rounded-lg border ${
                      frame.pageNumber !== null
                        ? "border-blue-200"
                        : "border-slate-200 bg-slate-50"
                    } ${
                      currentAccess &&
                      pageTable[currentAccess.pageNumber]?.frameNumber ===
                        frame.frameNumber
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                  >
                    <div className="text-xs text-slate-500 mb-1">
                      Frame {frame.frameNumber}
                    </div>
                    {frame.pageNumber !== null ? (
                      <div className="text-sm font-medium text-center">
                        Page {frame.pageNumber}
                        {pageEntry && pageEntry.modified && (
                          <span
                            className="inline-block ml-1 w-2 h-2 bg-amber-500 rounded-full"
                            title="Modified"
                          ></span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-center text-slate-400">
                        Empty
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-base font-semibold text-slate-800 mb-3">
              Performance Statistics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-200">
                <div className="text-sm text-slate-700">Total Accesses</div>
                <div className="text-xl font-bold text-slate-800">
                  {stats.totalAccesses}
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg text-center border border-green-200">
                <div className="text-sm text-green-700">TLB Hits</div>
                <div className="text-xl font-bold text-green-800">
                  {stats.tlbHits}
                </div>
                {stats.totalAccesses > 0 && (
                  <div className="text-xs text-green-600">
                    {((stats.tlbHits / stats.totalAccesses) * 100).toFixed(1)}%
                  </div>
                )}
              </div>

              <div className="p-3 bg-red-50 rounded-lg text-center border border-red-200">
                <div className="text-sm text-red-700">Page Faults</div>
                <div className="text-xl font-bold text-red-800">
                  {stats.pageFaults}
                </div>
                {stats.totalAccesses > 0 && (
                  <div className="text-xs text-red-600">
                    {((stats.pageFaults / stats.totalAccesses) * 100).toFixed(
                      1
                    )}
                    %
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setActiveTab("setup")}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Back to Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualMemory;
