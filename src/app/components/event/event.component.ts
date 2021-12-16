import { Component, OnInit } from '@angular/core';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import {Event} from "../../models/event";
import {EventService} from "../../services/event/event.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;
import {Time} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {

  isAuth: boolean = true;
  accesHandicape: boolean = false;
  restaurationSurPlace: boolean = false;
  accesWc: boolean = false;
  parking: boolean = false;
  animauxAutorises: boolean = false;
  faTimes = faTimes;
  faCheck = faCheck;
  event?: Event;
  trailer?: SafeResourceUrl;
  faTwitter = faTwitter;
  faFacebookF = faFacebookF;
  faYoutube = faYoutube;
  faInstagram = faInstagram;

  currentEvent = this.router.snapshot.paramMap.get("uid");

  constructor(private eventService : EventService, private domSanitizer: DomSanitizer,
              private router: ActivatedRoute, private routerBis: Router) { }

  ngOnInit(): void {
    this.getEvent();
  }

  private getEvent() {
    if(this.currentEvent) {
      this.eventService.getEventById(this.currentEvent)
        .then((docsnapshot) => {
          console.log(docsnapshot.data())
          let data = docsnapshot.data();
          if (data) {
            this.event = data;
            this.event.uid = docsnapshot.id;
          }else {
            this.routerBis.navigate(["/not-found"]);
            Promise.reject("Event n'existe pas");
          }
          if (this.event?.trailer)
            this.trailer = this.domSanitizer.bypassSecurityTrustResourceUrl(this.event.trailer);
          let access = this.event?.accessibilities;
          this.accesHandicape = !!access?.includes("accesHandicape");
          this.restaurationSurPlace = !!access?.includes("restaurationSurPlace");
          this.accesWc = !!access?.includes("accesWc");
          this.parking = !!access?.includes("parking");
          this.animauxAutorises = !!access?.includes("animauxAutorises");
        })
        .catch(reason => {
          console.error("Erreur get event " + reason);
          this.routerBis.navigate(["/not-found"]);
        });
    }
  }

  onClickPage(page: string) {
    let url = page+this.event?.uid;
    this.routerBis.navigate([url],  {state: {data: this.event}});
  }
}
