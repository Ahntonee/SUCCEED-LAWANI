import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

type ContentMap = Record<string, string>;

const SiteContentContext = createContext<ContentMap>({});

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ContentMap>({});

  useEffect(() => {
    api.getContent().then(setContent).catch(console.error);
  }, []);

  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  );
}

export const useSiteContent = () => useContext(SiteContentContext);
