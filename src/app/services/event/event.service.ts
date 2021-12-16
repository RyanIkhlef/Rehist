import {Injectable} from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  FirestoreDataConverter,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query, setDoc, where
} from 'firebase/firestore';
import {Event} from "../../models/event";
import {UnitType} from "../../models/unit-type";
import {Association} from "../../models/association";
import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private static EVENT_TABLE = "/event";
  private db = getFirestore();

  constructor() { }

  getLatestEvents(nEvent: number) {
    const ref = collection(this.db, EventService.EVENT_TABLE);
    const getLatestQuery = query(ref, orderBy("date_begin", "asc"), limit(nEvent)).withConverter(this.getFirestoreConverter());
    return getDocs(getLatestQuery);
  }

  getNextEvents(nEvents: number) {
    const ref = collection(this.db, EventService.EVENT_TABLE);
    const getLatestQuery = query(ref, orderBy("created", "desc"), limit(nEvents)).withConverter(this.getFirestoreConverter());
    return getDocs(getLatestQuery);
  }

  getEventById(nEvent: string) {
    const ref = doc(this.db, EventService.EVENT_TABLE, nEvent).withConverter(this.getFirestoreConverter());
    return getDoc(ref);
  }

  addEvent(id_user: string,name:string, slogan:string,types_of_event:string,period:string,address:string,reservation_link:string,associations_presents:string[],description:string,volunteer:number,unitType:UnitType[],isFree:boolean,program:string,price_per_age:string[],social_network:string[],web:string,accessibilities:string,date_begin:Date,date_end:Date,trailer:string,logoUrl:string,bannerUrl:string) {

    const created = new Date(Date.now());
    console.log("slogan = " + slogan);
    const newEntry = new Event(id_user,name, slogan,types_of_event,period,created,address,reservation_link,associations_presents,description,volunteer,unitType,isFree,program,price_per_age,social_network,web,accessibilities,date_begin,date_end,trailer,logoUrl,bannerUrl);

    const ref = collection(this.db, EventService.EVENT_TABLE).withConverter(this.getFirestoreConverter());

    return addDoc(ref, newEntry);
  }

  getEventByUserId(userId: string) {
    const ref = collection(this.db, EventService.EVENT_TABLE);
    const getUserEvents = query(ref, where("id_user", "==", userId)).withConverter(this.getFirestoreConverter());
    return getDocs(getUserEvents);
  }
  getEvents() {
    const ref = collection(this.db, EventService.EVENT_TABLE);
    const getLatestQuery = query(ref, orderBy("date_begin", "desc")).withConverter(this.getFirestoreConverter());
    return getDocs(getLatestQuery);
  }

  updateEvent(event: Event) {
    if(event.uid) {
      const ref = doc(this.db, EventService.EVENT_TABLE, event.uid).withConverter(this.getFirestoreConverter());
      return setDoc(ref, event);
    }
    return new Promise<void>((_, reject) => reject("Event uid undefined"));
  }

  deleteEvent(uid: string) {
    const ref = doc(this.db, EventService.EVENT_TABLE, uid);
    return deleteDoc(ref);
  }


  private getFirestoreConverter(): FirestoreDataConverter<Event> {
    return {
      toFirestore: (event: Event) => {
        return {
          id_user: event.id_user,
          name: event.name,
          slogan: event.slogan,
          types_of_event: event.types_of_event,
          period: event.period,
          created: event.created,
          address: event.address,
          reservation_link: event.reservation_Link,
          associations_presents: event.associations_presents,
          description: event.description,
          volunteer: event.volunteer,
          unitType: event.unitType,
          isFree: event.isFree,
          program: event.program,
          price_per_age: event.price_per_age,
          social_network: event.social_network,
          web: event.web,
          accessibilities: event.accessibilities,
          date_begin: event.date_begin,
          date_end: event.date_end,
          trailer: event.trailer,
          logo: event.logo,
          banner: event.banner
        };
      },
      fromFirestore: (snapshot: { data: (arg0: any) => any; }, options: any) => {
        const data = snapshot.data(options);

        return new Event(data.id_user, data.name, data.slogan, data.types_of_event, data.period,data.created,data.address, data.reservation_link, data.associations_presents,
          data.description,data.volunteer, data.unitType, data.isFree, data.program, data.price_per_age, data.social_network, data.web, data.accessibilities,
          data.date_begin.toDate(), data.date_end.toDate(), data.trailer, data.logo, data.banner, data.uid);
      }
    };
  }
}
