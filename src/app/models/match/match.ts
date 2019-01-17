import { Team } from "../team/team";
import { Field } from "../field/field";

export interface Match {
    Local: Team,
    Visit: Team,
    Date?: any,
    Field?: Field,
    GoalsLocal?: number,
    GoalsVisit?: number,
    Finished?: boolean
}
