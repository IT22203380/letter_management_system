import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Letter } from '../types/letter';

interface LetterContextType {
  letters: Letter[];
  addLetter: (letter: Omit<Letter, 'id'>) => void;
  updateLetter: (id: string, updatedLetter: Partial<Letter>) => void;
  deleteLetter: (id: string) => void;
  getLetterById: (id: string) => Letter | undefined;
}

const STORAGE_KEY = 'letters';

const LetterContext = createContext<LetterContextType | undefined>(undefined);

export const LetterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [letters, setLetters] = useState<Letter[]>(() => {
    // Load letters from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Save to localStorage whenever letters change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
    }
  }, [letters]);

  const addLetter = (letter: Omit<Letter, 'id'>) => {
    const newLetter: Letter = {
      ...letter,
      id: Date.now().toString(),
    };
    setLetters(prevLetters => [newLetter, ...prevLetters]);
    return newLetter;
  };

  const updateLetter = (id: string, updatedData: Partial<Letter>) => {
    setLetters(prevLetters =>
      prevLetters.map(letter =>
        letter.id === id ? { ...letter, ...updatedData } : letter
      )
    );
  };

  const deleteLetter = (id: string) => {
    setLetters(prevLetters => prevLetters.filter(letter => letter.id !== id));
  };

  const getLetterById = (id: string) => {
    return letters.find(letter => letter.id === id);
  };

  return (
    <LetterContext.Provider
      value={{
        letters,
        addLetter,
        updateLetter,
        deleteLetter,
        getLetterById,
      }}
    >
      {children}
    </LetterContext.Provider>
  );
};

// Export the main context hook
export const useLetterContext = () => {
  const context = useContext(LetterContext);
  if (!context) {
    throw new Error('useLetterContext must be used within a LetterProvider');
  }
  return context;
};

// Alias for backward compatibility
export const useLetters = useLetterContext;

export default LetterContext;
