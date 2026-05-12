import { useEffect, useState } from "react";
import {
  collection,
  query,
  QueryConstraint,
  getDocs,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

interface UseFirestoreOptions {
  subscribe?: boolean;
}

export function useFirestore<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: UseFirestoreOptions = {}
) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints);

    if (options.subscribe) {
      // Real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as (T & { id: string })[];
          setData(docs);
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
          const snapshot = await getDocs(q);
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as (T & { id: string })[];
          setData(docs);
          setError(null);
        } catch (err) {
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [collectionName, options.subscribe]);

  return { data, loading, error };
}
