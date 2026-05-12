import { useState } from "react";
import {
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
  collection,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

interface MutationState {
  loading: boolean;
  error: Error | null;
  success: boolean;
}

export function useFirestoreMutation() {
  const [state, setState] = useState<MutationState>({
    loading: false,
    error: null,
    success: false,
  });

  const add = async (
    collectionName: string,
    data: DocumentData
  ): Promise<string | null> => {
    setState({ loading: true, error: null, success: false });
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setState({ loading: false, error: null, success: true });
      return docRef.id;
    } catch (error) {
      const err = error as Error;
      setState({ loading: false, error: err, success: false });
      return null;
    }
  };

  const set = async (
    collectionName: string,
    docId: string,
    data: DocumentData,
    merge = false
  ): Promise<boolean> => {
    setState({ loading: true, error: null, success: false });
    try {
      const docRef = doc(db, collectionName, docId);
      await setDoc(
        docRef,
        {
          ...data,
          updatedAt: Timestamp.now(),
        },
        { merge }
      );
      setState({ loading: false, error: null, success: true });
      return true;
    } catch (error) {
      const err = error as Error;
      setState({ loading: false, error: err, success: false });
      return false;
    }
  };

  const update = async (
    collectionName: string,
    docId: string,
    data: DocumentData
  ): Promise<boolean> => {
    setState({ loading: true, error: null, success: false });
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      setState({ loading: false, error: null, success: true });
      return true;
    } catch (error) {
      const err = error as Error;
      setState({ loading: false, error: err, success: false });
      return false;
    }
  };

  const remove = async (
    collectionName: string,
    docId: string
  ): Promise<boolean> => {
    setState({ loading: true, error: null, success: false });
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      setState({ loading: false, error: null, success: true });
      return true;
    } catch (error) {
      const err = error as Error;
      setState({ loading: false, error: err, success: false });
      return false;
    }
  };

  return {
    ...state,
    add,
    set,
    update,
    remove,
  };
}
