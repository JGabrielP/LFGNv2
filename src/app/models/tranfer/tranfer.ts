import { Player } from "../player/player";
import { Team } from "../team/team";

export interface Tranfer {
    Player: Player,
    TeamSource: Team,
    TeamDestin: Team,
    Date: Date
}
