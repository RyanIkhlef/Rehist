import {
  addDoc,
  collection, deleteDoc,
  doc,
  FirestoreDataConverter,
  getDocs,
  getFirestore,
  orderBy,
  query, setDoc,
  where
} from "firebase/firestore";
import {Portfolio} from "../../models/portfolio";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})

export class PortfolioService {
  private static PORTFOLIO_TABLE = "/portfolio";
  private db = getFirestore();

  constructor() {
  }

  getAllMediasByAssos(numAssos: string) {
    const ref = collection(this.db, PortfolioService.PORTFOLIO_TABLE);
    const allMedias = query(ref, where("uid_association", "==", numAssos), orderBy("published", "desc")).withConverter(this.getFirestoreConverter());
    return getDocs(allMedias);
  }

  addMedia(media: Portfolio) {
    const ref = collection(this.db, PortfolioService.PORTFOLIO_TABLE).withConverter(this.getFirestoreConverter());
    return addDoc(ref, media);
  }

  updateMedia(media: Portfolio) {
    if(media.uid) {
      const ref = doc(this.db, PortfolioService.PORTFOLIO_TABLE, media.uid).withConverter(this.getFirestoreConverter());
      return setDoc(ref, media);
    }
    return new Promise<void>((_, reject) => reject("Media uid undefined"));
  }

  deleteMedia(media: Portfolio) {
    if(media.uid) {
      const ref = doc(this.db, PortfolioService.PORTFOLIO_TABLE, media.uid);
      return deleteDoc(ref);
    }
    return new Promise<void>((_, reject) => reject("Media uid undefined"));
  }

  private getFirestoreConverter(): FirestoreDataConverter<Portfolio> {
    return {
      toFirestore: (portfolio: Portfolio) => {
        return {
          uid_association: portfolio.uid_association,
          type: portfolio.type,
          titre: portfolio.titre,
          lieu: portfolio.lieu,
          published: portfolio.published,
          lien: portfolio.lien,
          date: portfolio.date
        };
      },
      fromFirestore: (snapshot: { data: (arg0: any) => any; }, options: any) => {
        const data = snapshot.data(options);
        return new Portfolio(data.uid_association, data.type, data.titre, data.lieu, data.published.toDate(), data.lien, data.date.toDate());
      }
    }
  }
}
