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
  query, setDoc,
  where
} from 'firebase/firestore';
import {Association} from "../../models/association";
import {UnitType} from "../../models/unit-type";

@Injectable({
  providedIn: 'root'
})
export class AssociationService {

  private static ASSOCIATION_TABLE = "/association";
  private db = getFirestore();

  constructor() { }

  /**
   * Retrieves data from association of the latest associations limited by the parameter.
   *
   * @param nAsso the number of element that you want to load
   */
  getLatestAssociations(nAsso: number) {
    const ref = collection(this.db, AssociationService.ASSOCIATION_TABLE);
    const getLatestQuery = query(ref, orderBy("created", "desc"), limit(nAsso)).withConverter(this.getFirestoreConverter());
    return getDocs(getLatestQuery);
  }

  getAssociationById(nAsso: string) {
    const ref = doc(this.db, AssociationService.ASSOCIATION_TABLE, nAsso).withConverter(this.getFirestoreConverter());
    return getDoc(ref);
  }

  getAssociations() {
    const ref = collection(this.db, AssociationService.ASSOCIATION_TABLE);
    const getLatestQuery = query(ref, orderBy("created", "desc")).withConverter(this.getFirestoreConverter());
    return getDocs(getLatestQuery);
  }

  addAssociation(id_user: string, name: string, description: string, firstname: string, lastname: string, address: string,
                 unitType: UnitType[], period: string, contact: string, tel: string, socialNetwork: string[],
                 numberOfVolunteers: number, website: string, slogan: string, logo: string, banner: string, recruitmentCondition: string, recruitment: boolean) {

    const created = new Date(Date.now());
    const newEntry = new Association(id_user, name, description, firstname, lastname, address, unitType, period, created, contact, tel, socialNetwork,
      website, numberOfVolunteers, slogan, logo, banner, recruitmentCondition, recruitment);

    const ref = collection(this.db, AssociationService.ASSOCIATION_TABLE).withConverter(this.getFirestoreConverter());
    return addDoc(ref, newEntry);
  }

  getAssociationByUserId(userId: string) {
    const ref = collection(this.db, AssociationService.ASSOCIATION_TABLE);
    const getUserAssociations = query(ref, where("id_user", "==", userId)).withConverter(this.getFirestoreConverter());
    return getDocs(getUserAssociations);
  }

  updateAssociation(association: Association) {
    if(association.uid) {
      const ref = doc(this.db, AssociationService.ASSOCIATION_TABLE, association.uid).withConverter(this.getFirestoreConverter());
      return setDoc(ref, association);
    }
    return new Promise<void>((_, reject) => reject("Association uid undefined"));
  }

  deleteAssociation(uid: string) {
    const ref = doc(this.db, AssociationService.ASSOCIATION_TABLE, uid);
    return deleteDoc(ref);
  }

  private getFirestoreConverter(): FirestoreDataConverter<Association> {
    return {
      toFirestore: (association: Association) => {
        return {
          id_user: association.id_user,
          name: association.name,
          description: association.description,
          leader_firstname: association.leader_firstname,
          leader_lastname: association.leader_lastname,
          address: association.address,
          unitType: association.unitType,
          period: association.period,
          created: association.created,
          contact: association.contact,
          tel: association.tel,
          social_network: association.social_network,
          web: association.web,
          volunteer: association.volunteer,
          slogan: association.slogan,
          logo: association.logo,
          banner: association.banner,
          conditions_recruitment: association.conditions_recruitment,
          recruitment: association.recruitment
        };
      },
      fromFirestore: (snapshot: { data: (arg0: any) => any; }, options: any) => {
        const data = snapshot.data(options);
        return new Association(data.id_user, data.name, data.description, data.leader_firstname, data.leader_lastname, data.address, data.unitType, data.period, data.created, data.contact, data.tel, data.social_network, data.web, data.volunteer, data.slogan, data.logo, data.banner, data.conditions_recruitment, data.recruitment, snapshot.data(indexedDB));
      }
    };
  }


}
