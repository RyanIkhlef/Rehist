import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import {UserService} from "../../services/user/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/user/auth.service";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  user?: User;

  constructor(private userService: UserService,
              private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.user = this.userService.currentConnectedUser;
    if(!this.user) {
      this.reject();
      return;
    }
  }

  private reject() {
    this.authService.redirectUrl = "/"+ this.route.snapshot.url.toString();
    this._snackBar.open("Vous devez être connecté pour accéder à cette page.", "fermer", {duration: 3000});
    this.router.navigate(["/sign-in"]);
    }
  onResetPassword() {
    if(this.user?.email)
      this.authService.resetPassword(this.user.email)
        .then(
          () => {
            this._snackBar.open("Un email a été envoyé pour changer votre mot de passe.", "fermer", {duration: 3000});
          })
        .catch(
          (error) => {
            console.error("Unable to reset your password : " + error);
            this._snackBar.open("Impossible de changer votre mot de passe pour le moment.", "fermer", {duration: 3000});
          })
  }

  onDeleteData() {
    if(this.user) {
      Swal.fire({
        title: 'Êtes-vous sûr de vouloir supprimer vos données ?',
        text: 'Si vous supprimez vos données, votre compte et toutes les données que vous nous avez fournis serons supprimés de nos services.\n' +
          'Il sera alors impossible de les récupérer ! Si vous avez publié des événements ou des associations, ils ne seront pas surprimés ! ',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: "J'ai bien compris",
        cancelButtonText: 'Oula non ! Annuler'

      }).then((result) => {

        if (result.value) {
          this.authService.delete()
            .then(
            () => {
              Swal.fire(
                'Vos données ont bien été supprimés !',
                "Le profile : " + this.user!.firstname + "\n" + this.user!.lastname + "\n" + this.user!.email + "\na bien été supprimé.",
                'success').then((result) => {
                  if(result.value) {
                    this.router.navigate([""]);
                  }
              })
            }).catch(
            (error) => {
              Swal.fire(
                "Vos données n'ont pas pu être supprimés.",
                error,
                'error')
            }
          )

        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire(
            'Vos données sont conservées !',
            'Heureux que vous restiez avec nous 🥰.',
            'error')
        }
      })
    }
  }

}
