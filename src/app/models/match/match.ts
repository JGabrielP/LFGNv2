import { Team } from "../team/team";
import { Field } from "../field/field";
import { Player } from "../player/player";

export interface Match {
    Local: Team,
    Visit: Team,
    Date?: any,
    Field?: Field,
    GoalsLocal?: number,
    GoalsVisit?: number,
    GoalsPlayersLocal?: Player[],
    GoalsPlayersVisit?: Player[],
    YCardsLocal?: Player[],
    YCardsVisit?: Player[],
    RCardsLocal?: Player[],
    RCardsVisit?: Player[],
    Finished?: boolean
}
