import {UnitType} from "./unit-type";
import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;
import {Validators} from "@angular/forms";
import {Time} from "@angular/common";

export class Event {
  constructor(public id_user: string,
              public name: string,
              public slogan: string,
              public types_of_event: string,
              public period: string,
              public created: Date,
              public address: string,
              public reservation_Link: string,
              public associations_presents: string[],
              public description: string,
              public volunteer: number,
              public unitType: UnitType[],
              public isFree: boolean,
              public program: string,
              public price_per_age: string[],
              public social_network: string[],
              public web: string,
              public accessibilities: string,
              public date_begin: Date,
              public date_end: Date,
              public trailer?: string,
              public logo?: string,
              public banner?: string,
              public uid?: string) {
  }
}
