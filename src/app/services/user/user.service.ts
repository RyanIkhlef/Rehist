import {Injectable} from '@angular/core';
import {User} from "../../models/user";
import {deleteDoc, doc, FirestoreDataConverter, getDoc, getFirestore, setDoc} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import {AuthService} from "./auth.service";
import {resolve} from "@angular/compiler-cli/src/ngtsc/file_system";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private static USER_TABLE = "user";
  private db = getFirestore();
  currentConnectedUser?: User;

  constructor() { }

  /**
   * Stores user in db
   */
  async storeNewUser(user: User) {
    const ref = doc(this.db, UserService.USER_TABLE, user.uid).withConverter(this.getFirestoreConverter());
    await setDoc(ref, user);
  }

  getUser(uid: string) {
    const ref = doc(getFirestore(), UserService.USER_TABLE, uid).withConverter(this.getFirestoreConverter());
    return getDoc(ref);
  }

  setCurrentUser() {
    let auth = getAuth();
    return new Promise<void>((resolve) => {
      if (auth && auth.currentUser !== null) {
        this.getUser(auth.currentUser.uid).then(
          (snapshot) => {
            this.currentConnectedUser = snapshot.data();
            resolve();
          }).catch(() => {
          this.currentConnectedUser = undefined;
          resolve()
        });
      } else {
        this.currentConnectedUser = undefined;
        resolve();
      }
    });
  }

  private getFirestoreConverter(): FirestoreDataConverter<User> {
    return {
      toFirestore: (user: User) => {
        return {
          uid: user.uid,
          lastname: user.lastname,
          firstname: user.firstname,
          email: user.email,
        };
      },
      fromFirestore: (snapshot: { data: (arg0: any) => any; }, options: any) => {
        const data = snapshot.data(options);
        return new User(data.uid, data.lastname, data.firstname, data.email);
      }
    };
  }

  deleteData(userId: string) {
    const ref = doc(this.db, UserService.USER_TABLE, userId);
    return deleteDoc(ref)
  }

}
