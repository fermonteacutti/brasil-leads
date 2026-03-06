import React, { createContext, useContext, useState } from "react";

export interface SearchFormData {
  // Step 1 - Business Type
  businessType: string;
  segment: string;
  // Step 2 - Location
  nationwide: boolean;
  state: string;
  city: string;
  radius: number | null;
  // Step 3 - Sources
  sources: string[];
  // Step 4 - Advanced Filters
  hasEmail: boolean;
  hasPhone: boolean;
  hasWebsite: boolean;
  hasSocialMedia: boolean;
  searchName: string;
}

const defaultData: SearchFormData = {
  businessType: "",
  segment: "",
  nationwide: false,
  state: "",
  city: "",
  radius: null,
  sources: [],
  hasEmail: false,
  hasPhone: false,
  hasWebsite: false,
  hasSocialMedia: false,
  searchName: "",
};

interface WizardContextType {
  step: number;
  setStep: (s: number) => void;
  data: SearchFormData;
  updateData: (partial: Partial<SearchFormData>) => void;
  reset: () => void;
}

const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be inside WizardProvider");
  return ctx;
}

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SearchFormData>(defaultData);

  const updateData = (partial: Partial<SearchFormData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const reset = () => {
    setStep(0);
    setData(defaultData);
  };

  return (
    <WizardContext.Provider value={{ step, setStep, data, updateData, reset }}>
      {children}
    </WizardContext.Provider>
  );
}
