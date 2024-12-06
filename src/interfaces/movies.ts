export interface Movie {
    id?: number;
    title: string;
    release_date: string;
    vote_average: number;
  }
  
  export interface MovieWithCredits extends Movie {
    editors: string[];
  }
  