import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

const PageReplacement = () => {
  // Visualization state
  const [frameCount, setFrameCount] = useState(3);
  const [referenceString, setReferenceString] = useState(
    "7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1"
  );
  const [parsedReferenceString, setParsedReferenceString] = useState([]);
  const [algorithm, setAlgorithm] = useState("fifo");
  const [isVisualizationRunning, setIsVisualizationRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showTheory, setShowTheory] = useState(true);
  const [frames, setFrames] = useState([]);
  const [pageFaults, setPageFaults] = useState(0);
  const [pageHits, setPageHits] = useState(0);
  const [stepHistory, setStepHistory] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [error, setError] = useState(null);

  // Animation reference
  const animationRef = useRef(null);

  // Parse the reference string when it changes
  useEffect(() => {
    try {
      // Parse the reference string into numbers
      const parsed = referenceString
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "")
        .map((item) => parseInt(item, 10));

      // Validate that all items are numbers
      if (parsed.some(isNaN)) {
        setError(
          "Reference string contains invalid entries. Please use numbers separated by commas."
        );
        return;
      }

      setParsedReferenceString(parsed);
      setError(null);
    } catch (err) {
      setError(
        "Invalid reference string format. Please use numbers separated by commas."
      );
    }
  }, [referenceString]);

  // Initialize frames when frame count changes
  useEffect(() => {
    resetSimulation();
  }, [frameCount, algorithm, parsedReferenceString]);

  // Animation effect
  useEffect(() => {
    if (isVisualizationRunning && currentStep < parsedReferenceString.length) {
      animationRef.current = setTimeout(() => {
        simulateStep();
      }, animationSpeed);
    } else if (currentStep >= parsedReferenceString.length) {
      setIsVisualizationRunning(false);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [
    isVisualizationRunning,
    currentStep,
    parsedReferenceString.length,
    animationSpeed,
  ]);

  // Reset the simulation
  const resetSimulation = () => {
    setIsVisualizationRunning(false);
    setCurrentStep(0);
    setFrames(Array(frameCount).fill(null));
    setPageFaults(0);
    setPageHits(0);
    setStepHistory([]);
  };

  // Toggle visualization play/pause
  const toggleVisualization = () => {
    setIsVisualizationRunning(!isVisualizationRunning);
  };

  // Simulate a single step
  const simulateStep = () => {
    if (currentStep >= parsedReferenceString.length) return;

    const page = parsedReferenceString[currentStep];
    const currentFrames = [...frames];
    let isPageFault = false;

    // Check if page is already in frames (page hit)
    if (currentFrames.includes(page)) {
      // Page hit
      setPageHits((prev) => prev + 1);

      // For LRU, update the order (move the page to the end which means it was most recently used)
      if (algorithm === "lru") {
        const index = currentFrames.indexOf(page);
        currentFrames.splice(index, 1);
        currentFrames.push(page);
      }
    } else {
      // Page fault
      isPageFault = true;
      setPageFaults((prev) => prev + 1);

      if (algorithm === "fifo") {
        // First-In-First-Out: replace the oldest page
        if (currentFrames.includes(null)) {
          // Fill empty frame first
          const emptyIndex = currentFrames.indexOf(null);
          currentFrames[emptyIndex] = page;
        } else {
          // Shift elements to the left (removing oldest) and add new page at the end
          currentFrames.shift();
          currentFrames.push(page);
        }
      } else if (algorithm === "lru") {
        // Least Recently Used: replace the least recently used page
        if (currentFrames.includes(null)) {
          // Fill empty frame first
          const emptyIndex = currentFrames.indexOf(null);
          currentFrames[emptyIndex] = page;
        } else {
          // Remove the first element (least recently used) and add new page at the end
          currentFrames.shift();
          currentFrames.push(page);
        }
      } else if (algorithm === "optimal") {
        // Optimal: replace the page that will not be used for the longest time
        if (currentFrames.includes(null)) {
          // Fill empty frame first
          const emptyIndex = currentFrames.indexOf(null);
          currentFrames[emptyIndex] = page;
        } else {
          // Find which page in the frames will be used furthest in the future
          const futureIndices = currentFrames.map((frame) => {
            const nextUseIndex = parsedReferenceString.findIndex(
              (p, i) => i > currentStep && p === frame
            );
            return nextUseIndex === -1 ? Infinity : nextUseIndex;
          });

          // Find the index of the page that will be used furthest in the future
          const replaceIndex = futureIndices.indexOf(
            Math.max(...futureIndices)
          );
          currentFrames[replaceIndex] = page;
        }
      }
    }

    // Save this step to history for visualization
    setStepHistory((prev) => [
      ...prev,
      {
        step: currentStep,
        page,
        frames: [...currentFrames],
        isPageFault,
      },
    ]);

    // Update state
    setFrames(currentFrames);
    setCurrentStep((prev) => prev + 1);
  };

  // Move to a specific step
  const goToStep = (step) => {
    if (step < 0) step = 0;
    if (step > parsedReferenceString.length)
      step = parsedReferenceString.length;

    // Reset simulation
    setFrames(Array(frameCount).fill(null));
    setPageFaults(0);
    setPageHits(0);
    setStepHistory([]);

    // Replay up to the selected step
    for (let i = 0; i < step; i++) {
      simulateStep();
    }
  };

  // Generate a random reference string
  const generateRandomReferenceString = () => {
    const length = 20;
    const maxPage = 9;
    const pages = Array.from({ length }, () =>
      Math.floor(Math.random() * (maxPage + 1))
    );
    setReferenceString(pages.join(","));
  };

  return (
    <div className="max-w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Page Replacement Algorithms
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
            Page Replacement Algorithms
          </h2>
          <div className="space-y-2 text-blue-900">
            <p>
              Page replacement algorithms decide which page to remove when a new
              page needs to be loaded into memory and all frames are full.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <b>FIFO (First-In-First-Out):</b> Replaces the oldest page in
                memory. Simple to implement but can suffer from the "Belady's
                anomaly" where increasing frames can increase page faults.
              </li>
              <li>
                <b>LRU (Least Recently Used):</b> Replaces the page that hasn't
                been used for the longest time. Performs better than FIFO but
                requires tracking when each page was last accessed.
              </li>
              <li>
                <b>Optimal:</b> Replaces the page that will not be used for the
                longest time in the future. This is theoretically optimal but
                requires future knowledge of page references.
              </li>
            </ul>
            <p className="mt-2">
              This visualization allows you to compare these algorithms with
              different reference strings and frame counts.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Configuration Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="fifo">FIFO - First In First Out</option>
              <option value="lru">LRU - Least Recently Used</option>
              <option value="optimal">Optimal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Number of Frames
            </label>
            <select
              value={frameCount}
              onChange={(e) => setFrameCount(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {[2, 3, 4, 5, 6].map((count) => (
                <option key={count} value={count}>
                  {count} frames
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reference String (comma-separated page numbers)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referenceString}
                onChange={(e) => setReferenceString(e.target.value)}
                className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 1,2,3,4,1,2,5,1,2,3,4,5"
              />
              <button
                onClick={generateRandomReferenceString}
                className="px-3 py-1 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 text-sm"
              >
                Random
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization Controls */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={toggleVisualization}
            className={`px-4 py-2 rounded-lg text-white ${
              isVisualizationRunning
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isVisualizationRunning ? (
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
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
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
            <span>Step {parsedReferenceString.length}</span>
          </div>
          <input
            type="range"
            min="0"
            max={parsedReferenceString.length}
            value={currentStep}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="text-center text-sm text-slate-700 mt-1">
            Current Step: {currentStep} / {parsedReferenceString.length}
          </div>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Visualization
        </h2>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-2">
            Page Reference Sequence
          </h3>
          <div className="flex flex-wrap gap-2">
            {parsedReferenceString.map((page, index) => (
              <div
                key={index}
                className={`w-8 h-8 flex items-center justify-center rounded-md border ${
                  index < currentStep
                    ? "bg-blue-50 border-blue-200"
                    : index === currentStep
                    ? "bg-blue-100 border-blue-300 ring-2 ring-blue-500"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                {page}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-2">
            Memory Frames
          </h3>
          <div className="relative overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-slate-700 w-20">
                    Step
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-slate-700 w-20">
                    Page
                  </th>
                  {Array.from({ length: frameCount }).map((_, i) => (
                    <th
                      key={i}
                      className="px-2 py-2 text-center text-xs font-medium text-slate-700"
                    >
                      Frame {i + 1}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-left text-xs font-medium text-slate-700 w-24">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {stepHistory.map((step, index) => (
                  <tr
                    key={index}
                    className={`${
                      index === stepHistory.length - 1
                        ? "bg-blue-50"
                        : index % 2 === 0
                        ? "bg-slate-50"
                        : "bg-white"
                    }`}
                  >
                    <td className="border px-2 py-2 text-sm text-slate-600">
                      {step.step + 1}
                    </td>
                    <td className="border px-2 py-2 text-center text-sm font-medium">
                      {step.page}
                    </td>
                    {step.frames.map((frame, i) => (
                      <td
                        key={i}
                        className={`border px-2 py-2 text-center text-sm ${
                          frame === step.page && step.isPageFault
                            ? "bg-green-100 text-green-800 font-medium"
                            : ""
                        }`}
                      >
                        {frame !== null ? frame : "-"}
                      </td>
                    ))}
                    <td className="border px-2 py-2 text-sm">
                      {step.isPageFault ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                          Page Fault
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Page Hit
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {stepHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan={frameCount + 3}
                      className="border px-4 py-8 text-center text-sm text-slate-500"
                    >
                      Click Play to start the visualization
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-200">
            <div className="text-sm text-slate-700">Page Faults</div>
            <div className="text-xl font-bold text-red-600">{pageFaults}</div>
            {currentStep > 0 && (
              <div className="text-xs text-slate-500">
                {((pageFaults / currentStep) * 100).toFixed(1)}%
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-200">
            <div className="text-sm text-slate-700">Page Hits</div>
            <div className="text-xl font-bold text-green-600">{pageHits}</div>
            {currentStep > 0 && (
              <div className="text-xs text-slate-500">
                {((pageHits / currentStep) * 100).toFixed(1)}%
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-200">
            <div className="text-sm text-slate-700">Hit Ratio</div>
            <div className="text-xl font-bold text-blue-600">
              {currentStep > 0
                ? ((pageHits / currentStep) * 100).toFixed(1) + "%"
                : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm Explanation */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Info className="w-5 h-5 text-blue-700" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            How{" "}
            {algorithm === "fifo"
              ? "FIFO"
              : algorithm === "lru"
              ? "LRU"
              : "Optimal"}{" "}
            Works
          </h2>
        </div>

        <div className="prose prose-slate max-w-none">
          {algorithm === "fifo" && (
            <>
              <p>
                <strong>First-In-First-Out (FIFO)</strong> is the simplest page
                replacement algorithm:
              </p>
              <ul>
                <li>
                  When a page fault occurs and all frames are full, it replaces
                  the oldest page (the one that has been in memory the longest).
                </li>
                <li>
                  FIFO maintains a queue of pages, with the oldest page at the
                  front.
                </li>
                <li>
                  When a page needs to be replaced, the page at the front of the
                  queue is removed.
                </li>
                <li>New pages are added to the rear of the queue.</li>
              </ul>
              <p>
                <strong>Advantages:</strong> Simple to understand and implement.
              </p>
              <p>
                <strong>Disadvantages:</strong> May remove frequently used
                pages. Can suffer from "Belady's anomaly" where increasing the
                number of frames causes more page faults.
              </p>
            </>
          )}

          {algorithm === "lru" && (
            <>
              <p>
                <strong>Least Recently Used (LRU)</strong> replaces the page
                that hasn't been used for the longest time:
              </p>
              <ul>
                <li>
                  When a page fault occurs and all frames are full, it replaces
                  the page that has not been accessed for the longest period.
                </li>
                <li>LRU requires tracking when each page was last accessed.</li>
                <li>
                  In this simulation, we track page access by moving accessed
                  pages to the end of our list, keeping least recently used
                  pages at the front.
                </li>
              </ul>
              <p>
                <strong>Advantages:</strong> Better performance than FIFO,
                closer to optimal.
              </p>
              <p>
                <strong>Disadvantages:</strong> More complicated to implement in
                hardware, requires tracking page access times.
              </p>
            </>
          )}

          {algorithm === "optimal" && (
            <>
              <p>
                <strong>Optimal (or Belady's algorithm)</strong> is
                theoretically the best possible algorithm:
              </p>
              <ul>
                <li>
                  When a page fault occurs and all frames are full, it replaces
                  the page that will not be used for the longest time in the
                  future.
                </li>
                <li>
                  This requires future knowledge of the reference string, making
                  it impractical in real systems.
                </li>
                <li>
                  It serves as a theoretical benchmark to evaluate other
                  algorithms.
                </li>
              </ul>
              <p>
                <strong>Advantages:</strong> Guarantees the lowest possible page
                fault rate.
              </p>
              <p>
                <strong>Disadvantages:</strong> Impossible to implement in real
                systems because it requires knowledge of future references.
              </p>
            </>
          )}

          {currentStep > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800">
                <strong>Current Status:</strong> This simulation has completed{" "}
                {currentStep} steps with {pageFaults} page faults (
                {((pageFaults / currentStep) * 100).toFixed(1)}% fault rate).
                {currentStep === parsedReferenceString.length && (
                  <>
                    {" "}
                    The{" "}
                    {algorithm === "fifo"
                      ? "FIFO"
                      : algorithm === "lru"
                      ? "LRU"
                      : "Optimal"}{" "}
                    algorithm with {frameCount} frames resulted in a{" "}
                    {((pageHits / currentStep) * 100).toFixed(1)}% hit ratio.
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageReplacement;
