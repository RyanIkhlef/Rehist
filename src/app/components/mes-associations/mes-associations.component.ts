import {Component, OnInit} from '@angular/core';
import {Association} from "../../models/association";
import {AssociationService} from "../../services/association/association.service";
import {UserService} from "../../services/user/user.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {getAuth} from "firebase/auth";

@Component({
  selector: 'app-mes-associations',
  templateUrl: './mes-associations.component.html',
  styleUrls: ['./mes-associations.component.css']
})
export class MesAssociationsComponent implements OnInit {

  associations: Association[] = [];

  constructor(private associationService: AssociationService,
              private userService: UserService,
              private router: Router,
              private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.initAssociation();
  }

  private initAssociation() {
    const currentUser = getAuth().currentUser;
    if(currentUser && currentUser.uid) {
      this.associationService.getAssociationByUserId(currentUser.uid)
        .then(
          (querySnapshot) => {
            querySnapshot.forEach(snapshot => {
              let association = snapshot.data();
              association.uid = snapshot.id;
              this.associations.push(association);
            })
        })
        .catch(
          (error) => {
            console.error("Unable to get associations data for the current user id." + error);
            this._snackBar.open("Impossible de récupérer vos associations pour le moment.", "fermer", {duration: 5000})
              .onAction()
              .subscribe(() => this.router.navigate(["/contact"]));
        });
    } else {
        this._snackBar.open("Vous devez être connecté pour accéder à cette page.", "fermer", {duration: 3000});
        this.router.navigate(["/sign-in"]);
    }
  }

  onDeleteAssociation(uid?: string) {
    if(uid) {
      this.associationService.deleteAssociation(uid)
        .then(() => {
          this._snackBar.open("L'association à bien été supprimée.", "fermer", {duration: 3000});
          this.router.navigate(["/myAssociations"]);
        })
        .catch((reason) => {
          console.error("Unable to delete this association. " + reason);
          this._snackBar.open("Impossible de supprimer cette association pour le moment.", "", {duration: 5000});
        });
    }
  }

  onUpdateClick(association: Association) {
    this.router.navigate(["updateAssociation"],  {state: {data: association}});
  }
}
