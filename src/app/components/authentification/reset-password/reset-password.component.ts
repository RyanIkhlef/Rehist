import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../services/user/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  resetForm!: FormGroup;

  constructor(private auth: AuthService,
              private formBuilder: FormBuilder,
              private _snackBar: MatSnackBar,
              private router: Router) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.resetForm = this.formBuilder.group({
      email: ["", [Validators.email, Validators.required]]
    });
  }

  onSubmit() {
    const email = this.resetForm.value["email"];
    this.auth.resetPassword(email).then(() => {
      this._snackBar.open("Mail envoyé à l'adresse : " + email, "fermer");
      this.router.navigate(["/sign-in"]);
    })
      .catch(
        (error) => {
          let message: string;
          switch (error.code) {
            case 'auth/expired-action-code':
              message = "Temps expiré, réessayez.";
              break;
            case 'auth/invalid-action-code':
              message = "Code invalide.";
              break;
            case 'auth/user-disabled':
              message = "Votre compte a été désactivé. Contactez un admin.";
              break;
            case 'auth/user-not-found':
              message = "Aucun compte n'est associé à cette adresse mail.";
              break;
            default:
              message = "Une erreur inattendue est survenue, vérifiez votre adresse mail et réessayez.";
              break;
          }
          this._snackBar.open(message, "fermer", {panelClass: ["mat-toolbar", "mat-warn"]});
      });
  }
}
