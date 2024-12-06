export interface CrewMember {
    id: number;
    name: string;
    known_for_department: string;
  }
  
  export interface Credits {
    crew: CrewMember[];
  }  