import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash,
  Info,
  ArrowRight,
  List,
  Grid,
} from "lucide-react";

const PageAllocation = () => {
  // Configuration state
  const [memorySize, setMemorySize] = useState(64); // in KB
  const [pageSize, setPageSize] = useState(4); // in KB
  const [allocationPolicy, setAllocationPolicy] = useState("firstfit"); // firstfit, bestfit, worstfit
  const [viewMode, setViewMode] = useState("visual"); // visual or table
  const [processes, setProcesses] = useState([]);
  const [nextProcessId, setNextProcessId] = useState(1);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [memoryMap, setMemoryMap] = useState([]);
  const [showTheory, setShowTheory] = useState(true);
  const [animationRunning, setAnimationRunning] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [eventLog, setEventLog] = useState([]);
  const [memoryUtilization, setMemoryUtilization] = useState(0);
  const [fragmentationStats, setFragmentationStats] = useState({
    internal: 0,
    external: 0,
  });
  const [error, setError] = useState(null);

  // Animation timer reference
  const animationTimer = useRef(null);

  // Calculate derived values
  const totalPages = Math.floor(memorySize / pageSize);

  // Initialize memory map when configuration changes
  useEffect(() => {
    initializeMemoryMap();
  }, [memorySize, pageSize]);

  // Initialize memory map
  const initializeMemoryMap = () => {
    const pages = Math.floor(memorySize / pageSize);
    const newMemoryMap = Array(pages)
      .fill()
      .map((_, i) => ({
        pageId: i,
        status: "free",
        processId: null,
        allocated: false,
        fragmentation: 0,
      }));

    setMemoryMap(newMemoryMap);
    setFragmentationStats({ internal: 0, external: 0 });
    setMemoryUtilization(0);
  };

  // Add a new process
  const addProcess = () => {
    if (processes.length >= 10) {
      setError("Maximum of 10 processes allowed");
      return;
    }

    // Generate random process size (between 1-8 pages)
    const sizeInPages = Math.floor(Math.random() * 8) + 1;
    const sizeInKB = sizeInPages * pageSize;
    const actualSizeInKB = Math.max(
      sizeInKB - Math.floor(Math.random() * pageSize),
      1
    ); // Simulate internal fragmentation

    const newProcess = {
      id: nextProcessId,
      name: `Process ${nextProcessId}`,
      sizeInPages,
      sizeInKB,
      actualSizeInKB,
      allocatedPages: [],
      status: "waiting", // waiting, allocated, completed
      color: getProcessColor(nextProcessId),
      createdAt: Date.now(),
    };

    setProcesses([...processes, newProcess]);
    setNextProcessId(nextProcessId + 1);

    // Add to event log
    addEvent(
      `Process ${newProcess.id} created, requesting ${sizeInPages} pages (${sizeInKB} KB)`
    );

    // Try to allocate memory for the process
    allocateMemory(newProcess);
  };

  // Add a custom-sized process
  const addCustomProcess = (sizeInKB) => {
    if (processes.length >= 10) {
      setError("Maximum of 10 processes allowed");
      return;
    }

    if (sizeInKB <= 0 || sizeInKB > memorySize) {
      setError(`Process size must be between 1 and ${memorySize} KB`);
      return;
    }

    const sizeInPages = Math.ceil(sizeInKB / pageSize);
    const actualSizeInKB = sizeInKB;

    const newProcess = {
      id: nextProcessId,
      name: `Process ${nextProcessId}`,
      sizeInPages,
      sizeInKB: sizeInPages * pageSize,
      actualSizeInKB,
      allocatedPages: [],
      status: "waiting",
      color: getProcessColor(nextProcessId),
      createdAt: Date.now(),
    };

    setProcesses([...processes, newProcess]);
    setNextProcessId(nextProcessId + 1);

    // Add to event log
    addEvent(
      `Process ${newProcess.id} created, requesting ${sizeInPages} pages (${
        sizeInPages * pageSize
      } KB)`
    );

    // Try to allocate memory for the process
    allocateMemory(newProcess);
  };

  // Allocate memory for a process
  const allocateMemory = (process) => {
    // Deep clone the memory map to avoid direct state mutation
    const updatedMemoryMap = [...memoryMap];

    // Count free pages
    const freePages = updatedMemoryMap.filter(
      (page) => page.status === "free"
    ).length;

    if (freePages < process.sizeInPages) {
      addEvent(
        `Not enough memory for Process ${process.id}. Required: ${process.sizeInPages} pages, Available: ${freePages} pages`
      );
      setError(
        `Not enough memory for Process ${process.id}. Required: ${process.sizeInPages} pages, Available: ${freePages} pages`
      );
      return false;
    }

    let allocatedPageIds = [];

    // Allocate based on policy
    if (allocationPolicy === "firstfit") {
      // First Fit: Allocate the first contiguous block of memory that is large enough
      allocatedPageIds = firstFitAllocation(
        updatedMemoryMap,
        process.sizeInPages
      );
    } else if (allocationPolicy === "bestfit") {
      // Best Fit: Allocate the smallest contiguous block of memory that is large enough
      allocatedPageIds = bestFitAllocation(
        updatedMemoryMap,
        process.sizeInPages
      );
    } else if (allocationPolicy === "worstfit") {
      // Worst Fit: Allocate the largest contiguous block of memory that is large enough
      allocatedPageIds = worstFitAllocation(
        updatedMemoryMap,
        process.sizeInPages
      );
    }

    if (allocatedPageIds.length === 0) {
      addEvent(
        `Memory allocation failed for Process ${process.id} due to fragmentation`
      );
      setError(
        `Memory allocation failed for Process ${process.id} due to fragmentation`
      );
      return false;
    }

    // Update memory map
    allocatedPageIds.forEach((pageId) => {
      updatedMemoryMap[pageId].status = "allocated";
      updatedMemoryMap[pageId].processId = process.id;
      updatedMemoryMap[pageId].allocated = true;

      // Calculate internal fragmentation for the last page
      if (pageId === allocatedPageIds[allocatedPageIds.length - 1]) {
        const remainingBytes =
          process.sizeInPages * pageSize - process.actualSizeInKB;
        updatedMemoryMap[pageId].fragmentation = remainingBytes;
      }
    });

    // Update process status
    const updatedProcesses = processes.map((p) => {
      if (p.id === process.id) {
        return {
          ...p,
          status: "allocated",
          allocatedPages: allocatedPageIds,
        };
      }
      return p;
    });

    setMemoryMap(updatedMemoryMap);
    setProcesses(updatedProcesses);

    // Update memory utilization and fragmentation stats
    updateMemoryStats(updatedMemoryMap, updatedProcesses);

    // Add to event log
    addEvent(
      `Memory allocated for Process ${
        process.id
      }. Pages: ${allocatedPageIds.join(", ")}`
    );

    return true;
  };

  // First Fit allocation algorithm
  const firstFitAllocation = (memMap, pagesNeeded) => {
    const allocatedPages = [];

    // Look for first available block of contiguous memory
    for (let i = 0; i < memMap.length; i++) {
      if (memMap[i].status === "free") {
        // Check if we can fit the process starting from this page
        let contiguousCount = 0;
        let candidatePages = [];

        for (
          let j = i;
          j < memMap.length && contiguousCount < pagesNeeded;
          j++
        ) {
          if (memMap[j].status === "free") {
            contiguousCount++;
            candidatePages.push(j);
          } else {
            break;
          }
        }

        if (contiguousCount >= pagesNeeded) {
          // We found a suitable block
          for (let k = 0; k < pagesNeeded; k++) {
            allocatedPages.push(candidatePages[k]);
          }
          break;
        }

        // Move i to the end of the checked block to avoid checking the same pages again
        i += contiguousCount - 1;
      }
    }

    return allocatedPages;
  };

  // Best Fit allocation algorithm
  const bestFitAllocation = (memMap, pagesNeeded) => {
    let bestFitSize = Infinity;
    let bestFitStart = -1;

    // Find the smallest block that fits the process
    for (let i = 0; i < memMap.length; i++) {
      if (memMap[i].status === "free") {
        // Measure this free block
        let blockSize = 0;
        for (let j = i; j < memMap.length && memMap[j].status === "free"; j++) {
          blockSize++;
        }

        // If this block fits and is smaller than the current best fit, update best fit
        if (blockSize >= pagesNeeded && blockSize < bestFitSize) {
          bestFitSize = blockSize;
          bestFitStart = i;
        }

        // Move i to the end of this block
        i += blockSize - 1;
      }
    }

    // If we found a suitable block, allocate it
    if (bestFitStart !== -1) {
      const allocatedPages = [];
      for (let i = 0; i < pagesNeeded; i++) {
        allocatedPages.push(bestFitStart + i);
      }
      return allocatedPages;
    }

    return [];
  };

  // Worst Fit allocation algorithm
  const worstFitAllocation = (memMap, pagesNeeded) => {
    let worstFitSize = 0;
    let worstFitStart = -1;

    // Find the largest block that fits the process
    for (let i = 0; i < memMap.length; i++) {
      if (memMap[i].status === "free") {
        // Measure this free block
        let blockSize = 0;
        for (let j = i; j < memMap.length && memMap[j].status === "free"; j++) {
          blockSize++;
        }

        // If this block fits and is larger than the current worst fit, update worst fit
        if (blockSize >= pagesNeeded && blockSize > worstFitSize) {
          worstFitSize = blockSize;
          worstFitStart = i;
        }

        // Move i to the end of this block
        i += blockSize - 1;
      }
    }

    // If we found a suitable block, allocate it
    if (worstFitStart !== -1) {
      const allocatedPages = [];
      for (let i = 0; i < pagesNeeded; i++) {
        allocatedPages.push(worstFitStart + i);
      }
      return allocatedPages;
    }

    return [];
  };

  // Deallocate memory for a process
  const deallocateProcess = (processId) => {
    // Find the process
    const process = processes.find((p) => p.id === processId);
    if (!process || process.status !== "allocated") {
      return;
    }

    // Deep clone the memory map to avoid direct state mutation
    const updatedMemoryMap = [...memoryMap];

    // Free the allocated pages
    process.allocatedPages.forEach((pageId) => {
      updatedMemoryMap[pageId].status = "free";
      updatedMemoryMap[pageId].processId = null;
      updatedMemoryMap[pageId].allocated = false;
      updatedMemoryMap[pageId].fragmentation = 0;
    });

    // Update process status
    const updatedProcesses = processes.map((p) => {
      if (p.id === processId) {
        return {
          ...p,
          status: "completed",
          allocatedPages: [],
        };
      }
      return p;
    });

    setMemoryMap(updatedMemoryMap);
    setProcesses(updatedProcesses);

    // Update memory utilization and fragmentation stats
    updateMemoryStats(updatedMemoryMap, updatedProcesses);

    // Add to event log
    addEvent(`Memory deallocated for Process ${processId}`);
  };

  // Start an automatic demo
  const startAnimation = () => {
    setAnimationRunning(true);

    // Schedule periodic actions
    animationTimer.current = setInterval(() => {
      // 50% chance to add a new process
      if (Math.random() < 0.5 && processes.length < 10) {
        addProcess();
      }

      // 30% chance to deallocate a random allocated process
      const allocatedProcesses = processes.filter(
        (p) => p.status === "allocated"
      );
      if (Math.random() < 0.3 && allocatedProcesses.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * allocatedProcesses.length
        );
        deallocateProcess(allocatedProcesses[randomIndex].id);
      }
    }, animationSpeed);
  };

  // Stop the animation
  const stopAnimation = () => {
    setAnimationRunning(false);
    if (animationTimer.current) {
      clearInterval(animationTimer.current);
      animationTimer.current = null;
    }
  };

  // Reset the simulation
  const resetSimulation = () => {
    stopAnimation();
    initializeMemoryMap();
    setProcesses([]);
    setNextProcessId(1);
    setSelectedProcess(null);
    setEventLog([]);
    setError(null);
  };

  // Update memory statistics
  const updateMemoryStats = (memMap, procs) => {
    // Calculate memory utilization
    const allocatedPages = memMap.filter(
      (page) => page.status === "allocated"
    ).length;
    const utilization = (allocatedPages / totalPages) * 100;

    // Calculate internal fragmentation (wasted space inside allocated pages)
    const totalInternalFragmentation = memMap.reduce(
      (sum, page) => sum + page.fragmentation,
      0
    );

    // Calculate external fragmentation (free pages that can't be used due to non-contiguity)
    let externalFragmentation = 0;
    let i = 0;
    while (i < memMap.length) {
      if (memMap[i].status === "free") {
        let contiguousCount = 0;
        while (i < memMap.length && memMap[i].status === "free") {
          contiguousCount++;
          i++;
        }

        // If this free block is too small to fit the smallest waiting process
        const smallestWaitingProcess = procs
          .filter((p) => p.status === "waiting")
          .sort((a, b) => a.sizeInPages - b.sizeInPages)[0];

        if (
          smallestWaitingProcess &&
          contiguousCount < smallestWaitingProcess.sizeInPages
        ) {
          externalFragmentation += contiguousCount * pageSize;
        }
      } else {
        i++;
      }
    }

    setMemoryUtilization(utilization);
    setFragmentationStats({
      internal: totalInternalFragmentation,
      external: externalFragmentation,
    });
  };

  // Add a new event to the log
  const addEvent = (message) => {
    setEventLog((prev) => [...prev, { timestamp: new Date(), message }]);
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
      "#667EEA", // indigo
      "#FC8181", // light red
    ];

    return colors[(id - 1) % colors.length];
  };

  // Render the visual memory map
  const renderVisualMemoryMap = () => {
    const rows = Math.ceil(Math.sqrt(totalPages));
    const cols = Math.ceil(totalPages / rows);

    return (
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {memoryMap.map((page) => {
          // Find process that owns this page
          const process = processes.find((p) => p.id === page.processId);
          const color = process ? process.color : "#F3F4F6";
          const borderColor = process ? process.color : "#E5E7EB";

          return (
            <div
              key={page.pageId}
              className="aspect-square rounded border flex flex-col items-center justify-center text-xs transition-colors cursor-pointer"
              style={{
                backgroundColor:
                  page.status === "allocated" ? color : "#F3F4F6",
                borderColor:
                  page.status === "allocated" ? borderColor : "#E5E7EB",
              }}
              onClick={() =>
                page.processId && setSelectedProcess(page.processId)
              }
              title={`Page ${page.pageId}: ${
                page.status === "allocated"
                  ? `Allocated to Process ${page.processId}`
                  : "Free"
              }`}
            >
              <div className="font-semibold">{page.pageId}</div>
              {page.status === "allocated" && (
                <div className="text-[10px]">P{page.processId}</div>
              )}
              {page.fragmentation > 0 && (
                <div
                  className="text-[8px] bg-white px-1 rounded-full mt-1"
                  title={`Wasted: ${page.fragmentation} KB`}
                >
                  +{page.fragmentation}KB
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render the memory map as a table
  const renderTableMemoryMap = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                Page
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                Status
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                Process
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                Fragmentation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {memoryMap.map((page) => {
              // Find process that owns this page
              const process = processes.find((p) => p.id === page.processId);

              return (
                <tr
                  key={page.pageId}
                  className={`hover:bg-slate-50 cursor-pointer ${
                    page.status === "allocated" ? "bg-opacity-10" : ""
                  }`}
                  onClick={() =>
                    page.processId && setSelectedProcess(page.processId)
                  }
                  style={{
                    backgroundColor:
                      page.status === "allocated" ? `${process?.color}20` : "",
                  }}
                >
                  <td className="px-3 py-2 text-sm text-slate-800 font-medium">
                    {page.pageId}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {page.status === "allocated" ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Allocated
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                        Free
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-600">
                    {page.processId ? (
                      <span className="inline-flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-1"
                          style={{ backgroundColor: process?.color }}
                        ></span>
                        Process {page.processId}
                      </span>
                    ) : (
                      "None"
                    )}
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-600">
                    {page.fragmentation > 0 ? `${page.fragmentation} KB` : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Page Allocation
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
            Page Allocation in Operating Systems
          </h2>
          <div className="space-y-2 text-blue-900">
            <p>
              Memory allocation in paged systems involves assigning physical
              memory frames to processes requesting memory. This is different
              from traditional contiguous allocation methods.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <b>Pages and Frames</b>: Physical memory is divided into
                fixed-size blocks called frames. Virtual memory is divided into
                same-sized blocks called pages.
              </li>
              <li>
                <b>Page Tables</b>: The OS maintains page tables to map virtual
                pages to physical frames.
              </li>
              <li>
                <b>Allocation Policies</b>:
                <ul className="list-none pl-5 pt-1">
                  <li>
                    • <span className="font-medium">First Fit</span>: Allocate
                    the first available contiguous block of frames large enough
                    to satisfy the request.
                  </li>
                  <li>
                    • <span className="font-medium">Best Fit</span>: Allocate
                    the smallest contiguous block that is large enough.
                  </li>
                  <li>
                    • <span className="font-medium">Worst Fit</span>: Allocate
                    the largest contiguous block available.
                  </li>
                </ul>
              </li>
              <li>
                <b>Fragmentation</b>:
                <ul className="list-none pl-5 pt-1">
                  <li>
                    •{" "}
                    <span className="font-medium">Internal Fragmentation</span>:
                    Wasted space within an allocated page when process doesn't
                    use the entire page.
                  </li>
                  <li>
                    •{" "}
                    <span className="font-medium">External Fragmentation</span>:
                    Free memory that exists in small, non-contiguous blocks that
                    cannot be allocated.
                  </li>
                </ul>
              </li>
            </ul>
            <p className="mt-2">
              This visualization demonstrates how different allocation policies
              affect memory utilization and fragmentation in a paged memory
              system.
            </p>
          </div>
        </div>
      )}

      {/* Concepts and Theory Section */}
      {showTheory && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-800 mb-3">
            Memory Allocation Concepts
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">
                Paging and Memory Allocation
              </h4>
              <p className="text-sm text-slate-600">
                Paging is a memory management scheme that eliminates the need
                for contiguous allocation of physical memory. It permits the
                physical address space of a process to be non-contiguous.
              </p>
              <p className="text-sm text-slate-600 mt-2">
                In a paged system, memory is divided into small fixed-size
                blocks called frames, and each process is divided into blocks of
                the same size called pages. The operating system keeps track of
                all free frames and allocates them to processes as needed.
              </p>

              <h4 className="text-sm font-medium text-slate-700 mt-4 mb-2">
                Allocation Policies
              </h4>
              <ul className="mt-2 pl-5 list-disc text-sm text-slate-600">
                <li className="mb-2">
                  <span className="font-medium text-slate-700">First Fit:</span>{" "}
                  Allocates the first available block of memory that is large
                  enough. Simple to implement but can lead to more external
                  fragmentation near the beginning of memory.
                </li>
                <li className="mb-2">
                  <span className="font-medium text-slate-700">Best Fit:</span>{" "}
                  Allocates the smallest available block that is large enough.
                  This minimizes wasted memory but can lead to tiny unusable
                  fragments and is slower to implement.
                </li>
                <li>
                  <span className="font-medium text-slate-700">Worst Fit:</span>{" "}
                  Allocates the largest available block. The rationale is that
                  this leaves large enough fragments for future allocation.
                  However, it performs poorly in practice.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">
                Types of Fragmentation
              </h4>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                <h5 className="text-sm font-medium text-blue-700 mb-1">
                  Internal Fragmentation
                </h5>
                <p className="text-sm text-blue-600">
                  Internal fragmentation occurs when memory is allocated in
                  fixed blocks, and the process doesn't use all the space in the
                  allocated block. This wasted space is internal to the
                  allocated region.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-8 bg-blue-200 rounded flex items-center px-2 text-xs text-blue-800">
                    Process Data (Used)
                  </div>
                  <div className="flex-1 h-8 bg-blue-100 rounded flex items-center px-2 text-xs text-blue-800 border-l border-blue-300">
                    Internal Fragmentation (Wasted)
                  </div>
                </div>
                <p className="text-xs text-blue-500 mt-1">
                  Example: A process needs 10KB but gets allocated 12KB (because
                  of page size), resulting in 2KB of internal fragmentation.
                </p>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <h5 className="text-sm font-medium text-red-700 mb-1">
                  External Fragmentation
                </h5>
                <p className="text-sm text-red-600">
                  External fragmentation occurs when free memory is broken into
                  small pieces that are not contiguous. Although there might be
                  enough total free memory, it cannot be allocated if the
                  process requires contiguous memory.
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-8 h-8 bg-green-200 rounded flex items-center justify-center text-xs text-green-800">
                    P1
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center text-xs text-red-800">
                    Free
                  </div>
                  <div className="w-8 h-8 bg-purple-200 rounded flex items-center justify-center text-xs text-purple-800">
                    P2
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center text-xs text-red-800">
                    Free
                  </div>
                  <div className="w-8 h-8 bg-yellow-200 rounded flex items-center justify-center text-xs text-yellow-800">
                    P3
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center text-xs text-red-800">
                    Free
                  </div>
                </div>
                <p className="text-xs text-red-500 mt-1">
                  Example: A system has 3KB of free memory, but it's fragmented
                  into 1KB chunks. A process needing 2KB contiguous memory
                  cannot be allocated.
                </p>
              </div>

              <h4 className="text-sm font-medium text-slate-700 mt-4 mb-2">
                Addressing in Paged Memory
              </h4>
              <p className="text-sm text-slate-600">
                In a paged system, each logical address consists of a page
                number and page offset. The page number is used as an index into
                the page table to get the corresponding frame number. This frame
                number is then combined with the page offset to form the
                physical address.
              </p>
              <div className="mt-2 bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center justify-center gap-1">
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded border border-blue-200 text-sm">
                    Page Number
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded border border-green-200 text-sm">
                    Page Table
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded border border-purple-200 text-sm">
                    Frame Number
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Configuration Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Memory Size
            </label>
            <select
              value={memorySize}
              onChange={(e) => {
                setMemorySize(Number(e.target.value));
                resetSimulation();
              }}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={processes.length > 0}
            >
              <option value="32">32 KB</option>
              <option value="64">64 KB</option>
              <option value="128">128 KB</option>
              <option value="256">256 KB</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Page Size
            </label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                resetSimulation();
              }}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={processes.length > 0}
            >
              <option value="1">1 KB</option>
              <option value="2">2 KB</option>
              <option value="4">4 KB</option>
              <option value="8">8 KB</option>
            </select>
            <div className="text-xs text-slate-500 mt-1">
              Total pages: {totalPages}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Allocation Policy
            </label>
            <select
              value={allocationPolicy}
              onChange={(e) => setAllocationPolicy(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="firstfit">First Fit</option>
              <option value="bestfit">Best Fit</option>
              <option value="worstfit">Worst Fit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={addProcess}
              disabled={animationRunning || processes.length >= 10}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Random Process
            </button>

            <button
              onClick={() =>
                addCustomProcess(
                  (Math.floor(Math.random() * 8 + 1) * pageSize) / 2
                )
              }
              disabled={animationRunning || processes.length >= 10}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Small Process
            </button>

            <button
              onClick={() =>
                addCustomProcess(Math.floor(Math.random() * 4 + 10) * pageSize)
              }
              disabled={animationRunning || processes.length >= 10}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Large Process
            </button>
          </div>

          <div className="flex gap-2 ml-auto">
            {animationRunning ? (
              <button
                onClick={stopAnimation}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-1"
              >
                <Pause className="w-4 h-4" /> Stop Demo
              </button>
            ) : (
              <button
                onClick={startAnimation}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1"
              >
                <Play className="w-4 h-4" /> Auto Demo
              </button>
            )}

            <button
              onClick={resetSimulation}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>

            <select
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              className="p-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="2000">Slow</option>
              <option value="1000">Normal</option>
              <option value="500">Fast</option>
            </select>

            <div className="flex gap-2 ml-2">
              <button
                onClick={() => setViewMode("visual")}
                className={`p-2 rounded-md ${
                  viewMode === "visual"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-700"
                }`}
                title="Visual View"
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md ${
                  viewMode === "table"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-700"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Visualization */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Memory Map
        </h2>

        <div className="mb-4">
          {viewMode === "visual"
            ? renderVisualMemoryMap()
            : renderTableMemoryMap()}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-200">
            <div className="text-sm text-slate-700">Memory Utilization</div>
            <div className="text-xl font-bold text-blue-600">
              {memoryUtilization.toFixed(1)}%
            </div>
            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${memoryUtilization}%` }}
              ></div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-200">
            <div className="text-sm text-slate-700">Internal Fragmentation</div>
            <div className="text-xl font-bold text-amber-600">
              {fragmentationStats.internal} KB
            </div>
            <div className="text-xs text-slate-500">
              {totalPages > 0
                ? (
                    (fragmentationStats.internal / (pageSize * totalPages)) *
                    100
                  ).toFixed(1)
                : 0}
              % of memory
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-200">
            <div className="text-sm text-slate-700">External Fragmentation</div>
            <div className="text-xl font-bold text-red-600">
              {fragmentationStats.external} KB
            </div>
            <div className="text-xs text-slate-500">
              {totalPages > 0
                ? (
                    (fragmentationStats.external / (pageSize * totalPages)) *
                    100
                  ).toFixed(1)
                : 0}
              % of memory
            </div>
          </div>
        </div>
      </div>

      {/* Selected Process Details */}
      {selectedProcess && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              {(() => {
                const process = processes.find((p) => p.id === selectedProcess);
                if (!process) return null;

                return (
                  <>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: process.color }}
                    ></div>
                    {process.name} - Details
                  </>
                );
              })()}
            </h3>
            <button
              onClick={() => setSelectedProcess(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </div>

          {(() => {
            const process = processes.find((p) => p.id === selectedProcess);
            if (!process) return null;

            // Calculate internal fragmentation for this process
            const internalFrag = process.sizeInKB - process.actualSizeInKB;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Process Information */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    Process Information
                  </h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-500">Process ID</div>
                        <div className="font-medium">{process.id}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-500">Status</div>
                        <div className="font-medium">
                          {process.status === "waiting" && (
                            <span className="text-yellow-700">Waiting</span>
                          )}
                          {process.status === "allocated" && (
                            <span className="text-green-700">Allocated</span>
                          )}
                          {process.status === "completed" && (
                            <span className="text-blue-700">Completed</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-500">
                          Size (pages)
                        </div>
                        <div className="font-medium">
                          {process.sizeInPages} pages
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-500">Size (KB)</div>
                        <div className="font-medium">{process.sizeInKB} KB</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-500">
                          Actual Size Used
                        </div>
                        <div className="font-medium">
                          {process.actualSizeInKB} KB
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-500">
                          Internal Fragmentation
                        </div>
                        <div className="font-medium">{internalFrag} KB</div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500">Created At</div>
                      <div className="font-medium">
                        {new Date(process.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Memory Allocation Details */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    Memory Allocation
                  </h4>
                  {process.status === "allocated" ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                        <div className="text-sm text-green-700 font-medium mb-2">
                          Allocated Pages
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {process.allocatedPages.map((pageId) => (
                            <span
                              key={pageId}
                              className="px-3 py-1 bg-white border border-green-200 text-green-800 rounded-lg text-sm"
                            >
                              Page {pageId}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <div className="text-sm text-blue-700 font-medium mb-2">
                          Allocation Policy
                        </div>
                        <div className="text-blue-800">
                          {allocationPolicy === "firstfit" &&
                            "First Fit: Allocated the first available block of memory large enough to fit the process"}
                          {allocationPolicy === "bestfit" &&
                            "Best Fit: Allocated the smallest available block of memory large enough to fit the process"}
                          {allocationPolicy === "worstfit" &&
                            "Worst Fit: Allocated the largest available block of memory large enough to fit the process"}
                        </div>
                      </div>

                      {internalFrag > 0 && (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                          <div className="text-sm text-amber-700 font-medium mb-2">
                            Internal Fragmentation
                          </div>
                          <div className="text-amber-800">
                            This process is causing {internalFrag} KB of
                            internal fragmentation (
                            {((internalFrag / process.sizeInKB) * 100).toFixed(
                              1
                            )}
                            % of its allocated memory).
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => deallocateProcess(process.id)}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                      >
                        <Trash className="w-4 h-4" /> Deallocate Process
                      </button>
                    </div>
                  ) : process.status === "waiting" ? (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex flex-col items-center justify-center h-full">
                      <div className="text-yellow-700 font-medium mb-2">
                        Process Waiting for Memory
                      </div>
                      <p className="text-yellow-600 text-center mb-4">
                        This process is waiting for {process.sizeInPages}{" "}
                        contiguous pages to be allocated.
                      </p>
                      {memoryMap.filter((page) => page.status === "free")
                        .length < process.sizeInPages ? (
                        <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
                          Not enough free pages available. Need to deallocate
                          other processes first.
                        </div>
                      ) : (
                        <div className="bg-amber-100 text-amber-700 p-2 rounded text-sm">
                          Free pages available, but may be fragmented. Try
                          changing allocation policy.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col items-center justify-center h-full">
                      <div className="text-blue-700 font-medium mb-2">
                        Process Completed
                      </div>
                      <p className="text-blue-600 text-center">
                        This process has been deallocated and its memory has
                        been released back to the system.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Processes and Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Process List */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center justify-between">
            <span>Processes</span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full">
              {processes.length} processes
            </span>
          </h3>

          {processes.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No processes yet. Add some processes to start.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {processes.map((process) => (
                <div
                  key={process.id}
                  className={`p-3 rounded-lg border ${
                    process.status === "waiting"
                      ? "bg-slate-50 border-slate-200"
                      : process.status === "allocated"
                      ? "bg-white"
                      : "bg-slate-50 border-slate-200 opacity-60"
                  } ${
                    selectedProcess === process.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() =>
                    setSelectedProcess(
                      process.id === selectedProcess ? null : process.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: process.color }}
                      ></div>
                      <span className="font-medium">{process.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {process.status === "waiting" && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Waiting
                        </span>
                      )}
                      {process.status === "allocated" && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Allocated
                        </span>
                      )}
                      {process.status === "completed" && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Completed
                        </span>
                      )}

                      {process.status === "allocated" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deallocateProcess(process.id);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Deallocate Process"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      <div className="text-xs text-slate-500">Size</div>
                      <div>
                        {process.sizeInKB} KB ({process.sizeInPages} pages)
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Actual Size</div>
                      <div>{process.actualSizeInKB} KB</div>
                    </div>
                  </div>

                  {process.status === "allocated" && (
                    <div className="mt-2">
                      <div className="text-xs text-slate-500">
                        Allocated Pages
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {process.allocatedPages.map((pageId) => (
                          <span
                            key={pageId}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {pageId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Log */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center justify-between">
            <span>Event Log</span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full">
              {eventLog.length} events
            </span>
          </h3>

          {eventLog.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No events yet. Actions will be logged here.
            </div>
          ) : (
            <div className="h-80 overflow-y-auto border rounded-lg">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Time
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Event
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {eventLog
                    .slice()
                    .reverse()
                    .map((event, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">
                          {event.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-800">
                          {event.message}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageAllocation;
