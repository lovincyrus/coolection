import { useEffect, useState } from "react";

export function useFetchItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/items")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(setItems)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
}
