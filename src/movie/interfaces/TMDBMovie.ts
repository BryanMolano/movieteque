export interface TMDBMovie {
  id: number;
  title: string;
  original_title:string; 
  poster_path: string | null;
  release_date: string;
  overview: string;
  backdrop_path: string;
}
