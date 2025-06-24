import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface OrgState {
  currentOrgId: string | null;
  setCurrentOrgId: (orgId: string | null) => void;
}

export const useOrgStore = create<OrgState>()(
  devtools(
    (set) => ({
      currentOrgId: null,
      setCurrentOrgId: (orgId) => set({ currentOrgId: orgId }),
    }),
    {
      name: "org-store",
    }
  )
);
