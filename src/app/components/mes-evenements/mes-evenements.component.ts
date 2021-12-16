import { Component, OnInit } from '@angular/core';
import { Event } from '../../models/event';
import {UserService} from "../../services/user/user.service";
import {EventService} from "../../services/event/event.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import { Router } from '@angular/router';
import {Association} from "../../models/association";
import {getAuth} from "firebase/auth";

@Component({
  selector: 'app-mes-evenements',
  templateUrl: './mes-evenements.component.html',
  styleUrls: ['./mes-evenements.component.css']
})
export class MesEvenementsComponent implements OnInit {

  events: Event[] = [];

  constructor(private userService: UserService,
              private eventService: EventService,
              private _snackBar: MatSnackBar,
              private router: Router) { }

  ngOnInit(): void {
    this.initEvents();
  }

  private initEvents() {
    const currentUser = getAuth().currentUser;
    if(currentUser && currentUser.uid) {
      this.eventService.getEventByUserId(currentUser.uid)
        .then(
          (querySnapshot) => {
            querySnapshot.forEach(snapshot => {
              let event = snapshot.data();
              event.uid = snapshot.id;
              this.events.push(event);
            })
          })
        .catch(
          (error) => {
            console.error("Unable to get events data for the current user id." + error);
            this._snackBar.open("Impossible de récupérer vos évènements pour le moment.", "nous contacter", {duration: 5000})
              .onAction()
              .subscribe(() => this.router.navigate(["/contact"]));
          });
    } else {
      this._snackBar.open("Vous devez être connecté pour accéder à cette page.", "fermer", {duration: 3000});
      this.router.navigate(["/sign-in"]);
    }
  }

  onDeleteEvent(event: Event) {
    if(event.uid) {
      this.eventService.deleteEvent(event.uid)
        .then(() => {
          this._snackBar.open("L'évènement à bien été supprimé.", "fermer", {duration: 3000});
          this.router.navigate(["/myEvents"]);
        })
        .catch((reason) => {
          console.error("Unable to delete this event. " + reason);
          this._snackBar.open("Impossible de supprimer cet évènement pour le moment.", "fermer", {duration: 5000})
        });
    }
  }

  onUpdateClick(event: Event) {
    this.router.navigate(["updateEvent"],  {state: {data: event}});
  }

}
