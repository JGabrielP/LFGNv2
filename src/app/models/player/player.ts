import { Team } from "../team/team";

export interface Player {
    Id: string,
    Name: string,
    FirstName: string,
    LastName: string,
    BirthDate: Date,
    PhotoUrl?: string,
    Team: Team,
    Folio: number;
}