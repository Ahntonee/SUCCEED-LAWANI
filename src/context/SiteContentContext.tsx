import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

type ContentMap = Record<string, string>;

interface SiteContentContextValue {
  content: ContentMap;
  isLoading: boolean;
  reload: () => void;
}

const SiteContentContext = createContext<SiteContentContextValue>({
  content: {},
  isLoading: true,
  reload: () => {},
});

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content,   setContent]   = useState<ContentMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [tick,      setTick]      = useState(0);

  useEffect(() => {
    setIsLoading(true);
    api.getContent()
      .then(setContent)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [tick]);

  const reload = () => setTick((t) => t + 1);

  return (
    <SiteContentContext.Provider value={{ content, isLoading, reload }}>
      {children}
    </SiteContentContext.Provider>
  );
}

/** Returns `{ content, isLoading, reload }`. */
export const useSiteContent = () => useContext(SiteContentContext);
