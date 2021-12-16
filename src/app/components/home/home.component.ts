import { Component, OnInit } from '@angular/core';
import {AssociationService} from "../../services/association/association.service";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {Association} from "../../models/association";
import {EventService} from "../../services/event/event.service";
import { Event } from "../../models/event";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  associations: Association[] = [];
  events: Event[] = [];
  private listLimit = 3; // nombre d'associations/événements à afficher sur la page.

  private gridByBreakpoint = {
    xl: 6,
    lg: 6,
    md: 6,
    sm: 3,
    xs: 3
  }

  constructor(private associationService : AssociationService,
              private eventService: EventService,
              private breakpointObserver: BreakpointObserver) {
    this.initGridResponsiveBreakpoints();
  }

  /**
   * Changes the number of associations and events shows on the page by the screen size
   */
  private initGridResponsiveBreakpoints() {
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,

    ]).subscribe(result => {
      if (result.matches) {
        if (result.breakpoints[Breakpoints.XSmall]) {
          this.listLimit = this.gridByBreakpoint.xs;
        }
        if (result.breakpoints[Breakpoints.Small]) {
          this.listLimit = this.gridByBreakpoint.sm;
        }
        if (result.breakpoints[Breakpoints.Medium]) {
          this.listLimit = this.gridByBreakpoint.md;
        }
        if (result.breakpoints[Breakpoints.Large]) {
          this.listLimit = this.gridByBreakpoint.lg;
        }
        if (result.breakpoints[Breakpoints.XLarge]) {
          this.listLimit = this.gridByBreakpoint.xl;
        }
      }
    });
  }

  ngOnInit(): void {
   this.getAssociationAndEventList();
  }

  /**
   * Gets and fill the association list.
   */
  private getAssociationList() {
    this.associationService.getLatestAssociations(this.listLimit)
      .then((querySnapshot) => {
        querySnapshot.forEach(snapshot => {
          let association = snapshot.data();
          association.uid = snapshot.id;
          this.associations.push(association);
        });
      })
      .catch(reason => console.error("Error in getting 3 latest associations : " + reason));
  }

  /**
   * Gets and fill the event list.
   */
  private getEventList() {
    this.eventService.getLatestEvents(this.listLimit)
      .then((querySnapshot) => {
        querySnapshot.forEach(snapshot => {
          let event = snapshot.data();
          event.uid = snapshot.id;
          this.events.push(event);
        });
      })
      .catch(reason => console.error("Error in getting 3 latest events : " + reason));
  }

  /**
   * Gets and fill the association list and event list
   *
   * @see getAssociationList
   * @see getEventList
   */
  private getAssociationAndEventList() {
    this.getAssociationList();
    this.getEventList();
  }
}
