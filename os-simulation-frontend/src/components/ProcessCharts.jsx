//LATEST ONE AND THE ONE ABOVE WORKS FINE
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
  ReferenceLine,
} from "recharts";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
} from "lucide-react";

// Custom animated bar for Gantt chart
const CustomGanttBar = (props) => {
  const { x, y, width, height, fill, animationData } = props;
  const { currentTime, processStart, processEnd } = animationData || {};

  // Calculate visible portion of the bar based on currentTime
  let visibleWidth = width;
  if (currentTime !== undefined) {
    // If animation is active and currentTime is set
    const processProgress = Math.min(
      Math.max(0, currentTime - processStart),
      processEnd - processStart
    );
    visibleWidth = (processProgress / (processEnd - processStart)) * width;
  }

  return (
    <g>
      {/* Background bar (lighter) */}
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={0.3}
        radius={[4, 4, 4, 4]}
        className="transition-all duration-300 ease-in-out"
      />
      {/* Foreground bar (progress) */}
      <Rectangle
        x={x}
        y={y}
        width={visibleWidth}
        height={height}
        fill={fill}
        radius={[4, 4, 4, 4]}
        opacity={0.9}
        className="transition-all duration-300 ease-in-out cursor-pointer"
      />
    </g>
  );
};

// Modern tooltip with enhanced mobile support
const EnhancedTooltip = ({ active, payload, label, isMobile }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className={`bg-white/95 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-lg border border-slate-200
                   ${
                     isMobile
                       ? "fixed left-1/2 -translate-x-1/2 bottom-4 w-[calc(100%-2rem)] max-w-sm z-50"
                       : "relative transform -translate-y-full"
                   }`}
      >
        <div className="font-semibold text-slate-800 mb-1.5 sm:mb-2 text-sm sm:text-base">
          Process {data.processId}
        </div>
        <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
          <div className="text-slate-600">
            Start Time:{" "}
            <span className="text-slate-800 font-medium">{data.start}</span>
          </div>
          <div className="text-slate-600">
            End Time:{" "}
            <span className="text-slate-800 font-medium">{data.end}</span>
          </div>
          <div className="text-slate-600">
            Duration:{" "}
            <span className="text-slate-800 font-medium">{data.duration}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Modern metrics tooltip with enhanced mobile support
const EnhancedMetricsTooltip = ({ active, payload, label, isMobile }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={`bg-white/95 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-lg border border-slate-200
                   ${
                     isMobile
                       ? "fixed left-1/2 -translate-x-1/2 bottom-4 w-[calc(100%-2rem)] max-w-sm z-50"
                       : "relative transform -translate-y-full"
                   }`}
      >
        <div className="font-semibold text-slate-800 mb-1.5 sm:mb-2 text-sm sm:text-base">
          {label}
        </div>
        <div className="space-y-0.5 sm:space-y-1">
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            >
              <div
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600">
                {entry.name}:{" "}
                <span className="text-slate-800 font-medium">
                  {entry.value}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const ProcessCharts = ({ processes, result }) => {
  const [chartHeight, setChartHeight] = useState(300);
  const [isMobile, setIsMobile] = useState(false);

  // Animation state
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAnimationControls, setShowAnimationControls] = useState(false);
  const animationRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setChartHeight(mobile ? 250 : 300);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate max time for animation
  const maxTime = useMemo(() => {
    if (!result || result.length === 0) return 0;
    return Math.max(...result.map((p) => p.completionTime));
  }, [result]);

  // Reset animation when result changes
  useEffect(() => {
    resetAnimation();
  }, [result]);

  // Animation frame handler
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animateFrame);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, playbackSpeed]);

  // Animation function
  const animateFrame = () => {
    setCurrentTime((prevTime) => {
      const nextTime = prevTime + 0.1 * playbackSpeed;
      if (nextTime >= maxTime) {
        setIsPlaying(false);
        return maxTime;
      }
      return nextTime;
    });
    animationRef.current = requestAnimationFrame(animateFrame);
  };

  // Animation controls
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const increaseSpeed = () => {
    setPlaybackSpeed((prev) => Math.min(prev + 0.5, 3));
  };

  const decreaseSpeed = () => {
    setPlaybackSpeed((prev) => Math.max(prev - 0.5, 0.5));
  };

  // Skip to end
  const skipToEnd = () => {
    setIsPlaying(false);
    setCurrentTime(maxTime);
  };

  if (!result || result.length === 0) return null;

  // Prepare Gantt data
  const ganttData = result.map((process) => ({
    processId: process.processId,
    start: process.startTime,
    end: process.completionTime,
    duration: process.completionTime - process.startTime,
  }));

  // Prepare metrics data
  const metricsData = result.map((process) => {
    const originalProcess = processes.find(
      (p) => p.processId === process.processId
    );
    return {
      processId: `P${process.processId}`,
      waitingTime: process.waitingTime || 0,
      turnaroundTime: process.turnaroundTime || 0,
      burstTime: originalProcess?.burstTime || 0,
    };
  });

  const maxCompletionTime = Math.max(...result.map((p) => p.completionTime));

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Animation Controls */}
      <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800">
            Process Timeline
          </h3>
          <button
            onClick={() => setShowAnimationControls(!showAnimationControls)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {showAnimationControls ? (
              <>
                Hide Animation Controls <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show Animation Controls <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {showAnimationControls && (
          <div className="mb-6 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Time:</span>
                <span className="text-sm font-medium text-slate-800">
                  {currentTime.toFixed(1)}
                </span>
                <span className="text-xs text-slate-500">/ {maxTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Speed:</span>
                <span className="text-sm font-medium text-slate-800">
                  {playbackSpeed.toFixed(1)}x
                </span>
              </div>
            </div>

            {/* Animation slider */}
            <div className="mb-4">
              <input
                type="range"
                min={0}
                max={maxTime}
                step={0.1}
                value={currentTime}
                onChange={(e) => {
                  setCurrentTime(parseFloat(e.target.value));
                  if (isPlaying) setIsPlaying(false);
                }}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Control buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={togglePlay}
                className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors duration-200"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Play
                  </>
                )}
              </button>
              <button
                onClick={resetAnimation}
                className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors duration-200"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button
                onClick={skipToEnd}
                className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors duration-200"
              >
                <FastForward className="w-4 h-4" /> End
              </button>
              <div className="flex items-center ml-auto">
                <button
                  onClick={decreaseSpeed}
                  disabled={playbackSpeed <= 0.5}
                  className="flex items-center justify-center w-8 h-8 text-slate-600 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md transition-colors duration-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={increaseSpeed}
                  disabled={playbackSpeed >= 3}
                  className="flex items-center justify-center w-8 h-8 text-slate-600 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <ResponsiveContainer
          width="100%"
          height={isMobile ? result.length * 50 + 50 : result.length * 70 + 50}
        >
          <BarChart
            layout="vertical"
            data={ganttData}
            barSize={isMobile ? 30 : 40}
            margin={
              isMobile
                ? { top: 10, right: 10, left: 40, bottom: 10 }
                : { top: 20, right: 30, left: 50, bottom: 20 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              domain={[0, maxCompletionTime]}
              tickCount={
                isMobile
                  ? Math.min(maxCompletionTime + 1, 6)
                  : maxCompletionTime + 1
              }
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis
              dataKey="processId"
              type="category"
              tickFormatter={(value) => `P${value}`}
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: isMobile ? 10 : 12 }}
            />
            <Tooltip
              content={(props) => (
                <EnhancedTooltip {...props} isMobile={isMobile} />
              )}
              cursor={false}
              trigger={isMobile ? ["click"] : ["hover"]}
            />
            <Bar
              dataKey="duration"
              fill="#3b82f6"
              shape={(props) => (
                <CustomGanttBar
                  {...props}
                  animationData={{
                    currentTime: currentTime,
                    processStart: props.payload.start,
                    processEnd: props.payload.end,
                  }}
                />
              )}
              className="cursor-pointer"
            />
            {/* Current time reference line */}
            {showAnimationControls && (
              <ReferenceLine
                x={currentTime}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `t=${currentTime.toFixed(1)}`,
                  position: "top",
                  fill: "#ef4444",
                  fontSize: 12,
                }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics - updated to show animation */}
      <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6">
          Performance Metrics
        </h3>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={metricsData.map((process) => {
              // For animation - calculate current metrics based on time
              if (showAnimationControls) {
                const proc = result.find(
                  (p) => `P${p.processId}` === process.processId
                );
                if (proc) {
                  const start = proc.startTime;
                  const end = proc.completionTime;
                  const animationProgress = Math.min(
                    Math.max(0, currentTime - start),
                    end - start
                  );
                  const isStarted = currentTime >= start;
                  const isCompleted = currentTime >= end;

                  return {
                    ...process,
                    waitingTime: isStarted ? process.waitingTime : 0,
                    turnaroundTime: isCompleted
                      ? process.turnaroundTime
                      : isStarted
                      ? animationProgress + process.waitingTime
                      : 0,
                    burstTime: isStarted
                      ? Math.min(animationProgress, process.burstTime)
                      : 0,
                  };
                }
              }
              return process;
            })}
            margin={
              isMobile
                ? { top: 10, right: 10, left: 10, bottom: 10 }
                : { top: 20, right: 30, left: 20, bottom: 20 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="processId"
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 30 : 40}
            />
            <Tooltip
              content={(props) => (
                <EnhancedMetricsTooltip {...props} isMobile={isMobile} />
              )}
              cursor={false}
              trigger={isMobile ? ["click"] : ["hover"]}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
            <Bar
              dataKey="waitingTime"
              name="Waiting Time"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer"
            />
            <Bar
              dataKey="turnaroundTime"
              name="Turnaround Time"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer"
            />
            <Bar
              dataKey="burstTime"
              name="Burst Time"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Process Distribution - updated to show animation */}
      <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6">
          Time Distribution
        </h3>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={metricsData.map((process) => {
              // For animation - calculate current metrics based on time
              if (showAnimationControls) {
                const proc = result.find(
                  (p) => `P${p.processId}` === process.processId
                );
                if (proc) {
                  const start = proc.startTime;
                  const end = proc.completionTime;
                  const isStarted = currentTime >= start;
                  const isCompleted = currentTime >= end;
                  const animationProgress = Math.min(
                    Math.max(0, currentTime - start),
                    end - start
                  );

                  return {
                    ...process,
                    waitingTime: isStarted ? process.waitingTime : 0,
                    burstTime: isStarted
                      ? Math.min(animationProgress, process.burstTime)
                      : 0,
                  };
                }
              }
              return process;
            })}
            margin={
              isMobile
                ? { top: 10, right: 10, left: 10, bottom: 10 }
                : { top: 20, right: 30, left: 20, bottom: 20 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="processId"
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 30 : 40}
            />
            <Tooltip
              content={(props) => (
                <EnhancedMetricsTooltip {...props} isMobile={isMobile} />
              )}
              cursor={false}
              trigger={isMobile ? ["click"] : ["hover"]}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
            <Bar
              dataKey="burstTime"
              name="CPU Time"
              stackId="a"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer"
            />
            <Bar
              dataKey="waitingTime"
              name="Waiting Time"
              stackId="a"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProcessCharts;
