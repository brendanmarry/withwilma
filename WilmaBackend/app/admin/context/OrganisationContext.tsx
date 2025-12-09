"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type OrganisationSummary = {
  id: string;
  name: string;
  rootUrl: string;
  createdAt: string;
  updatedAt: string;
  counts: {
    documents: number;
    faqs: number;
    jobs: number;
  };
};

type OrganisationContextType = {
  selectedOrganisation: OrganisationSummary | null;
  organisations: OrganisationSummary[];
  setSelectedOrganisation: (org: OrganisationSummary | null) => void;
  refreshOrganisations: () => Promise<void>;
  isLoading: boolean;
};

const OrganisationContext = createContext<OrganisationContextType | undefined>(undefined);

const STORAGE_KEY = "wilma_selected_organisation";

export const OrganisationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedOrganisation, setSelectedOrganisationState] =
    useState<OrganisationSummary | null>(null);
  const [organisations, setOrganisations] = useState<OrganisationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrganisations = async () => {
    try {
      const response = await fetch("/api/organisations");
      if (response.ok) {
        const data: OrganisationSummary[] = await response.json();
        setOrganisations(data);
        return data;
      }
      return [];
    } catch {
      return [];
    }
  };

  const setSelectedOrganisation = (org: OrganisationSummary | null) => {
    setSelectedOrganisationState(org);
    if (org) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(org));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const refreshOrganisations = async () => {
    const data = await fetchOrganisations();
    // Restore selected organisation if it still exists
    if (selectedOrganisation) {
      const restored = data.find((org) => org.id === selectedOrganisation.id);
      if (restored) {
        setSelectedOrganisationState(restored);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
      } else {
        // Selected org no longer exists, clear selection
        setSelectedOrganisationState(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const data = await fetchOrganisations();

      // Try to restore from localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed: OrganisationSummary = JSON.parse(stored);
          // Verify it still exists in the list
          const found = data.find((org) => org.id === parsed.id);
          if (found) {
            setSelectedOrganisationState(found);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      setIsLoading(false);
    };

    void initialize();
  }, []);

  return (
    <OrganisationContext.Provider
      value={{
        selectedOrganisation,
        organisations,
        setSelectedOrganisation,
        refreshOrganisations,
        isLoading,
      }}
    >
      {children}
    </OrganisationContext.Provider>
  );
};

export const useOrganisation = () => {
  const context = useContext(OrganisationContext);
  if (context === undefined) {
    throw new Error("useOrganisation must be used within an OrganisationProvider");
  }
  return context;
};

