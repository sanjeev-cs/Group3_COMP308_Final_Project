import { useEffect } from 'react';

const LOCK_COUNT_KEY = 'scrollLockCount';
const BODY_OVERFLOW_KEY = 'scrollLockBodyOverflow';
const HTML_OVERFLOW_KEY = 'scrollLockHtmlOverflow';

const useDocumentScrollLock = (locked) => {
  useEffect(() => {
    if (!locked || typeof document === 'undefined') {
      return undefined;
    }

    const { body, documentElement } = document;
    const currentCount = Number(body.dataset[LOCK_COUNT_KEY] || '0');

    if (currentCount === 0) {
      body.dataset[BODY_OVERFLOW_KEY] = body.style.overflow || '';
      documentElement.dataset[HTML_OVERFLOW_KEY] = documentElement.style.overflow || '';
      body.style.overflow = 'hidden';
      documentElement.style.overflow = 'hidden';
    }

    body.dataset[LOCK_COUNT_KEY] = String(currentCount + 1);

    return () => {
      const nextCount = Math.max(Number(body.dataset[LOCK_COUNT_KEY] || '1') - 1, 0);

      if (nextCount === 0) {
        body.style.overflow = body.dataset[BODY_OVERFLOW_KEY] || '';
        documentElement.style.overflow = documentElement.dataset[HTML_OVERFLOW_KEY] || '';
        delete body.dataset[LOCK_COUNT_KEY];
        delete body.dataset[BODY_OVERFLOW_KEY];
        delete documentElement.dataset[HTML_OVERFLOW_KEY];
        return;
      }

      body.dataset[LOCK_COUNT_KEY] = String(nextCount);
    };
  }, [locked]);
};

export default useDocumentScrollLock;
