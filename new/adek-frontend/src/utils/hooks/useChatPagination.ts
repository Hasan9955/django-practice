import { useCallback, useEffect, useRef, useState } from "react";

export const PAGE_LIMIT = 20;

/**
 * Manages per-conversation paginated message loading with scroll-based triggers.
 * Used by both DirectChat and SidebarChat.
 */
export function useChatPagination(conversationId: string | undefined) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Saved scroll height before prepend so we can restore position
  const prevScrollHeight = useRef(0);
  // Whether the last state update was a prepend (older msgs added to top)
  const justPrepended = useRef(false);

  // Reset all state when conversation changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setIsFetchingMore(false);
    setInitialLoaded(false);
    justPrepended.current = false;
    prevScrollHeight.current = 0;
  }, [conversationId]);

  /**
   * Call when the scroll container scrolls near the top.
   * Triggers loading the next (older) page.
   */
  const handleScrollForMore = useCallback(
    (container: HTMLDivElement | null) => {
      if (!container || !hasMore || isFetchingMore || !initialLoaded) return;
      if (container.scrollTop < 80) {
        prevScrollHeight.current = container.scrollHeight;
        setPage((p) => p + 1);
        setIsFetchingMore(true);
      }
    },
    [hasMore, isFetchingMore, initialLoaded]
  );

  /**
   * Restore scroll position after older messages were prepended.
   * Call this inside a useEffect that depends on the message list length,
   * but only when justPrepended.current is true.
   */
  const restoreScrollAfterPrepend = useCallback(
    (container: HTMLDivElement | null) => {
      if (!justPrepended.current || !container) return false;
      justPrepended.current = false;
      const newHeight = container.scrollHeight;
      container.scrollTop = newHeight - prevScrollHeight.current;
      return true;
    },
    []
  );

  return {
    page,
    hasMore,
    setHasMore,
    isFetchingMore,
    setIsFetchingMore,
    initialLoaded,
    setInitialLoaded,
    justPrepended,
    handleScrollForMore,
    restoreScrollAfterPrepend,
  };
}

/**
 * Manages paginated conversation list loading with sidebar scroll trigger.
 */
export function useConversationListPagination() {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const handleSidebarScroll = useCallback(
    (container: HTMLDivElement | null, onLoadMore: () => void) => {
      if (!container || isFetching || !hasMore) return;
      const nearBottom =
        container.scrollTop + container.clientHeight >= container.scrollHeight - 60;
      if (nearBottom) onLoadMore();
    },
    [isFetching, hasMore]
  );

  const loadNextPage = useCallback(() => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);
    setPage((p) => p + 1);
  }, [isFetching, hasMore]);

  const onPageLoaded = useCallback((count: number, total: number) => {
    setIsFetching(false);
    setHasMore(page * 20 < total);
  }, [page]);

  return {
    page,
    hasMore,
    setHasMore,
    isFetching,
    setIsFetching,
    loadNextPage,
    onPageLoaded,
    handleSidebarScroll,
  };
}