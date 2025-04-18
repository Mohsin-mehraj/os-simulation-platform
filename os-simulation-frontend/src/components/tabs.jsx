// components/ui/tabs.jsx
import React, { createContext, useContext, useState } from "react";

const TabsContext = createContext({
  value: "",
  onValueChange: () => {},
});

export const Tabs = ({ value, onValueChange, children, ...props }) => {
  const [tabValue, setTabValue] = useState(value);

  const contextValue = {
    value: value !== undefined ? value : tabValue,
    onValueChange: onValueChange || setTabValue,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div {...props}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabList = ({ children, className, ...props }) => {
  return (
    <div className={`flex ${className || ""}`} role="tablist" {...props}>
      {children}
    </div>
  );
};

export const Tab = ({ value, children, className, disabled, ...props }) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext);
  const isSelected = selectedValue === value;

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      className={`${className || ""} ${
        isSelected
          ? "border-b-2 border-blue-500 text-blue-600"
          : "text-slate-600 hover:text-slate-800"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={() => !disabled && onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabPanel = ({ value, children, className, ...props }) => {
  const { value: selectedValue } = useContext(TabsContext);
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <div role="tabpanel" className={className} {...props}>
      {children}
    </div>
  );
};
