import { useApp } from "../../../context/AppContext";

export function useActiveTab(page: string, defaultTab: string): string {
  const { state } = useApp();
  return state.pageTab[page] ?? defaultTab;
}
