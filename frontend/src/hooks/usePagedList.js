import { useCallback, useEffect, useState } from "react";
import { api, qs } from "../api/client";
import { useToast } from "../components/Toast";

export function usePagedList(path, extraParams = {}) {
  const { push } = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const extraKey = JSON.stringify(extraParams);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api(
        `${path}${qs({ page, pageSize, search, sortBy, sortOrder, ...JSON.parse(extraKey) })}`
      );
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      push(error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [path, page, pageSize, search, sortBy, sortOrder, extraKey, push]);

  useEffect(() => {
    load();
  }, [load]);

  const onSort = (key) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  return {
    items,
    total,
    page,
    setPage,
    pageSize,
    search,
    setSearch: (value) => {
      setSearch(value);
      setPage(1);
    },
    sortBy,
    sortOrder,
    onSort,
    loading,
    reload: load,
  };
}
