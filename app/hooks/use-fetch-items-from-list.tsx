import { useEffect, useState } from "react";

export function useFetchItemsFromList(listId: string) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/lists/${listId}/items`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(setItems)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [listId]);

  return { items, loading, error };
}
