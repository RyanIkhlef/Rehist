import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../services/user/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {getAuth, getRedirectResult} from "firebase/auth";
import {UserService} from "../../../services/user/user.service";

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  signInForm!: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private auth: AuthService,
              private userService: UserService,
              private router: Router,
              private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.signInForm = this.formBuilder.group(
      {
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required]]
      });
  }

  onSubmit() {
    const value = this.signInForm.value;
    const email = value['email'];

    this.auth.signInWithEmail(email, value['password'])
      .then(() => {
        this.router.navigate([""]);
      })
      .catch(
        (error) => {
          let errorMessage: string;
          switch (error.code) {
            case "auth/invalid-email":
              errorMessage = "Votre adresse mail ou votre mot de passe est incorrect.";
              break;
            case "auth/user-disabled":
              errorMessage = "Votre compte a été désactivé. Contactez un administrateur pour plus d'information.";
              break;
            case "auth/wrong-password":
              errorMessage = "Votre adresse mail ou votre mot de passe est incorrect.";
              break;
            case "auth/user-not-found":
              errorMessage = "Votre adresse mail ou votre mot de passe est incorrect.";
              break;
            default:
              errorMessage = "Impossible de vous connecter, réessayez plus tard ou contactez l'administrateur.";
              break;
          }
          this._snackBar.open(errorMessage, "fermer", {panelClass: ["mat-toolbar", "mat-warn"]});
        }
      )
  }

  onGoogleSignIn() {
    this.auth.signUpWithGoogle();
    this.router.navigate([""]);

  }

  onFacebookSignIn() {
    this.auth.signUpWithFacebook();
    this.router.navigate([""]);
  }

  onTwitterSignIn() {
    this.auth.signUpWithTwitter();
    this.router.navigate([""]);
  }
}
