export interface TMDBMovieDetailsResponse {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  overview: string;
  status:string;

  budget: number;
  revenue: number;
  runtime: number;
  origin_country: string[];
  original_language: string;

  popularity: number,
  vote_average: number,
  vote_count: number,

  genres: TMDBGenres[];
  credits: TMDBCredits;
  videos: TMDBVideos;
  images: TMDBImages;
  'watch/providers': TMDBWatchProviders;
}

export interface TMDBGenres{
  id: number; 
  name: string;
}
export interface TMDBCredits {
  cast: TMDBRawCast[];
  crew: TMDBRawCrew[];
}
export interface TMDBRawCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}
export interface TMDBRawCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBVideos {
  results: TMDBRawVideo[]; // TMDB mete los videos dentro de un arreglo "results"
}

export interface TMDBRawVideo {
  id: string;
  name: string;
  key: string;
  type: string;
  site: string;
}
export interface TMDBWatchProviders {
  results: {
    [countryCode: string]: {
      link: string;
      flatrate?: TMDBRawProvider[];
      rent?: TMDBRawProvider[];
      buy?: TMDBRawProvider[];
    };
  };
}

export interface TMDBRawProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface TMDBImages {
  backdrops: TMDBRawImage[];
  logos: TMDBRawImage[];
  posters: TMDBRawImage[];
}

export interface TMDBRawImage {
  file_path: string;
  height: number;
  width: number;
}
