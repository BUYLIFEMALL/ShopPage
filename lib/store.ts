interface StoredPage {
  html: string;
  createdAt: number;
}

const TTL_MS = 60 * 60 * 1000; // 1시간

// Next.js App Router에서 각 route가 별도 모듈로 실행되므로
// global 객체를 사용해 Map을 프로세스 전체에서 공유
const g = global as typeof global & {
  __pageStore?: Map<string, StoredPage>;
};

if (!g.__pageStore) {
  g.__pageStore = new Map<string, StoredPage>();
}

const store = g.__pageStore;

export function savePage(id: string, html: string): void {
  store.set(id, { html, createdAt: Date.now() });
}

export function getPage(id: string): string | null {
  const entry = store.get(id);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > TTL_MS) {
    store.delete(id);
    return null;
  }
  return entry.html;
}
