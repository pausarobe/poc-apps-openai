import { useSyncExternalStore } from 'react';

function getOpenAIValue<K extends keyof Window['openai']>(key: K) {
  return window.openai?.[key];
}

export function useOpenAiGlobal<K extends keyof Window['openai']>(key: K) {
  return useSyncExternalStore(
    (onStoreChange: () => void) => {
      let prev = getOpenAIValue(key);

      const handler = () => {
        const next = getOpenAIValue(key);
        if (next !== prev) {
          prev = next;
          onStoreChange();
        }
      };

      window.addEventListener('openai:set_globals', handler, { passive: true });
      return () => window.removeEventListener('openai:set_globals', handler);
    },
    () => getOpenAIValue(key),
    () => undefined,
  ) as Window['openai'][K];
}
