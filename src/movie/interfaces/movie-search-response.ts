import { TMDBMovie } from "./TMDBMovie";

export interface MovieSearchResponse {
  results: TMDBMovie[]; 
  page: number;
  total_results: number;
  total_pages: number;
}
