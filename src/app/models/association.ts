import {UnitType} from "./unit-type";

export class Association {

  constructor(public id_user: string,
              public name: string,
              public description: string,
              public leader_firstname: string,
              public leader_lastname: string,
              public address: string,
              public unitType: UnitType[],
              public period: string,
              public created: Date,
              public contact: string,
              public tel: string,
              public social_network?: string[],
              public web?: string,
              public volunteer?: number,
              public slogan?: string,
              public logo?: string,
              public banner?: string,
              public conditions_recruitment?: string,
              public recruitment = false,
              public uid?: string) {}
}
