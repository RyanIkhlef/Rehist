import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, sendPasswordResetEmail, deleteUser } from "firebase/auth";
import {User} from "../../models/user";
import {UserService} from "./user.service";
import {Router} from "@angular/router";
import {BehaviorSubject} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuth = new BehaviorSubject<boolean>(false);
  redirectUrl?: string;

  constructor(private userService: UserService, private router: Router) {
    getAuth().onAuthStateChanged(
      (user) => {
        this.isAuth.next(!!user);
        this.userService.setCurrentUser().then(() => {
          if (this.redirectUrl) {
            this.router.navigate([this.redirectUrl]);
          }
        });
      });
  }

  /**
   * sign-up new user by email address
   */
  signUpWithEmail(firstname: string, lastname: string, email: string, password: string) {
    const auth = getAuth();

    return new Promise<void>((resolve, reject) => {
      createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            let user = new User(userCredential.user.uid, firstname, lastname, email);
            this.userService.storeNewUser(user);
            this.userService.setCurrentUser();
            resolve();
          })
          .catch((error) => {
            let errorMessage;
            switch (error.code) {
              case "auth/email-already-in-use":
                errorMessage = "Cette adresse mail est déjà utilisée.";
                break;
              case "auth/invalid-email":
                errorMessage = "Votre adresse mail n'est pas valide.";
                break;
              case "auth/operation-not-allowed":
                errorMessage = "Impossible de vous enregistrer, réessayez plus tard ou contactez l'administrateur.";
                break;
              case "auth/weak-password":
                errorMessage = "Votre mot de passe n'est pas assez sécurisé.";
                break;
              default:
                errorMessage = "Impossible de vous enregistrer, réessayez plus tard ou contactez l'administrateur.";
                break;
            }
            reject(errorMessage);
          });
    });
  }

  signUpWithGoogle() {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    signInWithRedirect(auth, provider) .then(() => {
      getRedirectResult(getAuth())
        .then((result) => {
          console.log(result?.user);
          this.userService.setCurrentUser();
        }).catch(error => console.error("SignUp error with google : " + error.code + " : " + error.message))
    });


  }

  signUpWithFacebook() {
    const provider = new FacebookAuthProvider();
    const auth = getAuth();

    signInWithRedirect(auth, provider).then(r => getRedirectResult(auth)
      .then((result) => {
        console.log(result);
        this.userService.setCurrentUser();
      }).catch(error => console.error("SignUp error with Facebook : " + error.code + " : " + error.message)));

  }

  signUpWithTwitter() {
    const provider = new TwitterAuthProvider();
    const auth = getAuth();

    signInWithRedirect(auth, provider)
      .then((r) => {
        console.log("result 1 : " + r);
        this.userService.setCurrentUser();
        getRedirectResult(auth)
          .then((result) => {
            console.log("ok : " + result);
          }).catch(error => console.error("SignUp error with twitter : " + error.code + " : " + error.message))
      });
  }

  signInWithEmail(email: string, password: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      signInWithEmailAndPassword(getAuth(), email, password)
        .then(() => {
          this.userService.setCurrentUser();
          resolve()
        })
        .catch((error) => reject(error))
    });
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  delete() {
    const user = getAuth().currentUser;
    return new Promise<void>(
      (resolve, reject) => {
        if(user) {
          deleteUser(user)
            .then(() => this.userService.deleteData(user.uid)
              .then(() => resolve())
              .catch((error) => reject(error)))
            .catch((error) => reject(error));
        }
        else
          reject("User not found");
      }
    )
  }

  logout() {
    const auth = getAuth();
    if(auth.currentUser)
      auth.signOut()
        .then(() => this.userService.setCurrentUser())
        .catch((error) => console.error("Unable to disconnect user : " + error));
  }
}
