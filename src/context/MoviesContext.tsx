import { createContext, useContext, useMemo, useState } from "react";
import type { MovieItem } from "@/types/stats";

interface MoviesContextValue {
  allMovies: MovieItem[];
  setAllMovies: (movies: MovieItem[]) => void;
}

const MoviesContext = createContext<MoviesContextValue | null>(null);

export const MoviesProvider = ({ children }: { children: React.ReactNode }) => {
  const [allMovies, setAllMovies] = useState<MovieItem[]>([]);

  const value = useMemo(
    () => ({ allMovies, setAllMovies }),
    [allMovies]
  );

  return (
    <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MoviesContext);
  if (!context) {
    return { allMovies: [], setAllMovies: () => {} } as MoviesContextValue;
  }
  return context;
};
