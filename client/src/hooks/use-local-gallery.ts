import { useState, useEffect, useCallback } from "react";
import { type GalleryItem, type InsertGalleryItem } from "@shared/schema";

const LOCAL_GALLERY_KEY = "procam-local-gallery";
const PENDING_SYNC_KEY = "procam-pending-sync";

export interface LocalGalleryItem extends InsertGalleryItem {
  localId: string;
  synced: boolean;
  createdAt: string;
}

function getLocalItems(): LocalGalleryItem[] {
  try {
    const stored = localStorage.getItem(LOCAL_GALLERY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalItems(items: LocalGalleryItem[]): void {
  try {
    localStorage.setItem(LOCAL_GALLERY_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("[LocalGallery] Failed to save:", e);
  }
}

export function useLocalGallery() {
  const [items, setItems] = useState<LocalGalleryItem[]>([]);

  useEffect(() => {
    setItems(getLocalItems());
  }, []);

  const addItem = useCallback((data: InsertGalleryItem): LocalGalleryItem => {
    const newItem: LocalGalleryItem = {
      ...data,
      localId: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      synced: false,
      createdAt: new Date().toISOString(),
    };
    
    const updated = [newItem, ...getLocalItems()];
    saveLocalItems(updated);
    setItems(updated);
    return newItem;
  }, []);

  const markSynced = useCallback((localId: string) => {
    const current = getLocalItems();
    const updated = current.map(item => 
      item.localId === localId ? { ...item, synced: true } : item
    );
    saveLocalItems(updated);
    setItems(updated);
  }, []);

  const deleteItem = useCallback((localId: string) => {
    const current = getLocalItems();
    const updated = current.filter(item => item.localId !== localId);
    saveLocalItems(updated);
    setItems(updated);
  }, []);

  const getUnsyncedItems = useCallback((): LocalGalleryItem[] => {
    return getLocalItems().filter(item => !item.synced);
  }, []);

  const refresh = useCallback(() => {
    setItems(getLocalItems());
  }, []);

  return {
    items,
    addItem,
    markSynced,
    deleteItem,
    getUnsyncedItems,
    refresh,
  };
}
