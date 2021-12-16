import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../../services/user/auth.service";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  signUpForm!: FormGroup;
  passwordRegexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$"; // Minimum 8 caractères dont au moins 1 lettre majuscule, une minuscule et 1 chiffre.
                                                                        // /!\ Caractères spéciaux pas acceptés : à changer !
  constructor(private formBuilder: FormBuilder,
              private auth: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router) { }

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initializes the form group with this fields :
   * <ul>
   *   <li>lastname : represent the user's lastname. Must be a string of ASCII characters without numbers</li>
   *   <li>firstname : represent the user's firstname. Must be a string of ASCII characters without numbers</li>
   *   <li>email : represent the user's email. Must have email format.</li>
   *   <li>password : represent the user's password. Must content at least 1 number, 1 lowercase letter, 1 uppercase letter and at least 8 characters.</li>
   *   <li>confirmPassword : need to be the same password.</li>
   *   <li>tel : represent the user's telephone number. Must be a string of 10 numbers.</li>
   * </ul>
   */
  private initForm(): void {
    this.signUpForm = this.formBuilder.group({
      lastname: ["", [Validators.required]], // nom
      firstname: ["", [Validators.required]], // prénom
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.pattern(this.passwordRegexp)]],
      confirmPassword: ["", [Validators.required, Validators.pattern(this.passwordRegexp)]],
    }, {
      validators: SignUpComponent.checkPasswords
    });
  }

  /**
   * If failed : set error message and error code and logs it.
   *
   * else : calls the <code>signUp</code> method from AuthService to create new account then calls the <code>storeNewUser</code> method to store the user in the database.
   * finally navigate the user to the "nos-services" page.
   */
  onSubmit() {
    const values = this.signUpForm.value;
    const lastname = values["lastname"];
    const firstname = values["firstname"];
    const email = values["email"];

    this.auth.signUpWithEmail(firstname, lastname,email, values["password"]).then(() => this.router.navigate([""]))
      .catch((message) => this._snackBar.open(message, "fermer", {panelClass: ["mat-toolbar", "mat-warn"]}));
  }

  /**
   * Creates account with facebook auth module.
   */
  createWithFacebook(): any {
    this.auth.signUpWithFacebook();
    this.router.navigate([""]);
  }

  /**
   * Creates account with twitter auth module.
   */
  createWithTwitter(): any {
    this.auth.signUpWithTwitter();
    this.router.navigate([""]);
  }

  /**
   * Create account with google auth module.
   */
  createWithGoogle(): any {
    this.auth.signUpWithGoogle()
    this.router.navigate([""]);
  }

  private static checkPasswords(group: AbstractControl): ValidationErrors | null  {
    let pass = group.get('password')!.value;
    let confirmPass = group!.get('confirmPassword')!.value

    return pass === confirmPass ? null : {
      notSame: true
    }
  }
}

