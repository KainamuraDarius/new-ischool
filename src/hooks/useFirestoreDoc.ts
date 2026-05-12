import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  onSnapshot,
  DocumentData,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

interface UseFirestoreDocOptions {
  subscribe?: boolean;
}

export function useFirestoreDoc<T extends DocumentData>(
  collectionName: string,
  docId: string | null,
  options: UseFirestoreDocOptions = {}
) {
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, collectionName, docId);

    if (options.subscribe) {
      // Real-time listener
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot: DocumentSnapshot<DocumentData>) => {
          if (snapshot.exists()) {
            setData({
              id: snapshot.id,
              ...snapshot.data(),
            } as T & { id: string });
          } else {
            setData(null);
          }
          setLoading(false);
          setError(null);
        },
        (err) => {
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // One-time query
      (async () => {
        try {
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            setData({
              id: snapshot.id,
              ...snapshot.data(),
            } as T & { id: string });
          } else {
            setData(null);
          }
          setError(null);
        } catch (err) {
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [collectionName, docId, options.subscribe]);

  return { data, loading, error };
}
