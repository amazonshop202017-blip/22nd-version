import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoriesContextType {
  categories: Category[];
  addCategory: (name: string, color: string) => void;
  removeCategory: (id: string) => void;
  updateCategory: (id: string, name: string, color: string) => void;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

const CATEGORIES_STORAGE_KEY = 'trading-journal-categories';

const generateId = () => `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
      setCategories(JSON.parse(stored));
    }
  }, []);

  const saveCategories = useCallback((newCategories: Category[]) => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(newCategories));
    setCategories(newCategories);
  }, []);

  const addCategory = useCallback((name: string, color: string) => {
    const trimmed = name.trim();
    if (trimmed && !categories.some(c => c.name === trimmed)) {
      const newCategory: Category = {
        id: generateId(),
        name: trimmed,
        color,
      };
      saveCategories([...categories, newCategory]);
    }
  }, [categories, saveCategories]);

  const removeCategory = useCallback((id: string) => {
    saveCategories(categories.filter(c => c.id !== id));
  }, [categories, saveCategories]);

  const updateCategory = useCallback((id: string, name: string, color: string) => {
    const trimmed = name.trim();
    if (trimmed) {
      saveCategories(categories.map(c => 
        c.id === id ? { ...c, name: trimmed, color } : c
      ));
    }
  }, [categories, saveCategories]);

  return (
    <CategoriesContext.Provider value={{ categories, addCategory, removeCategory, updateCategory }}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategoriesContext = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategoriesContext must be used within CategoriesProvider');
  }
  return context;
};
