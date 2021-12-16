import { Component, OnInit } from '@angular/core';
import {UnitType} from "../../models/unit-type";
import {MatSelectChange} from "@angular/material/select";
import {NgForm} from "@angular/forms";
import {Event as RehistEvent} from "../../models/event";
import {EventService} from "../../services/event/event.service";
import { AddressService } from 'src/app/services/geolocation/address.service';
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatRadioChange} from "@angular/material/radio";

@Component({
  selector: 'app-event-all',
  templateUrl: './event-all.component.html',
  styleUrls: ['./event-all.component.css']
})
export class EventAllComponent implements OnInit {

  maxDist = 50;

  unitTypeValues = Object.values(UnitType) as string[];
  events: RehistEvent[] = [];
  allEvents: RehistEvent[] = [];

  locationSelected = "";
  numberOfVolunteers = "moreThan";
  manualGeolocation: boolean = false;

  latitude?: number;
  longitude?: number;
  userCity?: string;

  searchContent: string = "";
  unitSelected: UnitType[] = [];
  volunteerContent = 0;
  dateBegin?: Date;
  dateEnd?: Date;
  addressData: string[] = [];

  constructor(private eventService: EventService,
              private addressService: AddressService,
              private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getAssociations();
  }

  onSearch(event: Event) {
    const content = (event.target as HTMLInputElement).value;
    const size = content.length;
    if(size >= 3) {
      this.filter();
    }
  }

  onSearchByUnitType(event: MatSelectChange) {
    const content: any[] = event.source.value;
    this.filter();
  }

  onSearchByDate(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {
    this.dateBegin = new Date(EventAllComponent.formatDate(dateRangeStart.value));
    this.dateEnd = new Date(EventAllComponent.formatDate(dateRangeEnd.value));
    this.filter();
  }

  onComparisonChange(value: string) {
    const valueNumber = parseInt(value);
    if(!isNaN(valueNumber))
      this.filter();
  }

  onSearchByVolunteer(event: Event) {
    const content = parseInt((event.target as HTMLInputElement).value);
    if(!isNaN(content))
      this.filter();
  }

  onResetForm(searchForm: NgForm) {
    searchForm.resetForm();
    this.manualGeolocation = false;
    this.longitude = undefined;
    this.latitude = undefined;
    this.events = this.allEvents.slice();
  }

  onGeolocation() {
    this.manualGeolocation = false;
    this.getUserPosition()
      .then(() => {
        if(this.latitude && this.longitude) {
          this.addressService.getAddressByLatAndLng(this.latitude, this.longitude)
            .then((response) => {
              this.userCity = response.features[0].properties.city;
              this.filter();
            })
            .catch((error) => {
              console.error(error);
            });
        }
      }).catch((errorMessage) =>
      this._snackBar.open(errorMessage, "fermer", {duration: 5000}));
  }

  onManualGeolocation(event: Event) {
    const content = (event.target as HTMLInputElement).value;
    if(content) {
      this.userCity = content;
      this.addressService.getAddressByCity(this.userCity).then((response) => {
        let coordinates = response.features[0].geometry.coordinates
        this.latitude = coordinates[1];
        this.longitude = coordinates[0];
        this.filter();
      })
    }
  }

  onAddressInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const content = target.value;
    if(content.length > 3) {
      this.addressService.getAddress(content)
        .then(
          (features) => {
            features.forEach(
              (feature) => {
                let properties = feature.properties;
                this.addressData.push(properties.label);
              });
          })
        .catch(error => console.error(error))
    } else {
      this.addressData = [];
    }
  }

  private filter() {
    this.events = this.allEvents.slice();

    this.search();
    this.searchByUnitType();
    this.searchByDate();
    this.searchByVolunteer();
    this.searchByPosition();
  }

  private search() {
    if(this.searchContent != null) {
      this.events = this.events.filter((event) => {
        return event.name.toUpperCase().includes(this.searchContent.toUpperCase());
      });
    }
  }

  private searchByUnitType() {
    if(this.unitSelected && this.unitSelected.length > 0) {
      this.events = this.events.filter((event) => {
        return this.unitSelected.some(unit => event.unitType.includes(unit));
      });
    }
  }

  private searchByDate() {
    this.events = this.events.filter((event) => {
      if(this.dateBegin && this.dateEnd)
        return this.dateBegin <= event.date_begin && this.dateEnd >= event.date_end;
      return true;
    });
  }

  private searchByVolunteer() {
    if(this.volunteerContent > 0) {
      this.events = this.events.filter((event) => {
        if(!event.volunteer)
          return false;
        if(this.numberOfVolunteers === "moreThan")
          return this.volunteerContent <= event.volunteer;
        else if(this.numberOfVolunteers === "lessThan")
          return this.volunteerContent >= event.volunteer;

        return false;
      });
    }
  }

  private static formatDate(date:string): string {
    const dateAsArray = date.split('/');
    const dateIso = [dateAsArray[2], dateAsArray[1], dateAsArray[0]]
    return dateIso.join('-');
  }

  private getUserPosition() {
    return new Promise<void>((resolve, reject) => {
      let message = "Impossible d'accéder à votre géolocalisation.";
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          if (position) {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            resolve();
          }
        }, (error) => {
          switch (error.code) {
            case GeolocationPositionError.PERMISSION_DENIED:
              message = "Vous ne nous avez pas fourni la permission d'accéder à votre position.";
              reject(message);
              break;
            case GeolocationPositionError.POSITION_UNAVAILABLE:
              message = "Une erreur est survenue lors de la tentative d'accès à votre position.";
              reject(message);
              break;
            case GeolocationPositionError.TIMEOUT:
              message = "L'obtention de votre position à pris trop de temps.";
              reject(message);
              break;
          }
        });
      } else {
        message = "Désolé, il semblerait que votre appareil ne puisse être géolocalisé.";
        reject(message);
      }
    });
  }

  private async searchByPosition() {
    if(this.latitude && this.longitude) {
      let tmpEventList: RehistEvent[] = [];
      for (const event of this.events) {
        const eventCity = event.address.split(',')[2];
        let distance = this.maxDist * 2;
        if (eventCity) {
          distance = await this.getDistance(eventCity);
          console.log(eventCity + " : " + distance);
        }
        if (distance <= this.maxDist)
          tmpEventList.push(event);
      }
      this.events = tmpEventList.slice();
    }
  }

  private getDistance(city: string ) {
    let lat;
    let lng;
    let distance;
    return new Promise<number>((resolve, reject) => {
      this.addressService.getAddressByCity(city)
        .then((response) => {
          let coordinates = response.features[0].geometry.coordinates
          lat = coordinates[1];
          lng = coordinates[0];
          if(this.latitude && this.longitude) {
            distance = this.addressService.getDistanceBetween(this.latitude, this.longitude, lat, lng);
            resolve(distance);
          }
          reject();
        });
    });
  }

  private getAssociations() {
    this.eventService.getEvents()
      .then((querySnapshot) => {
        querySnapshot.forEach((snapshot) => {
          let event = snapshot.data();
          event.uid = snapshot.id;
          this.allEvents.push(event);
        })
        this.events = this.allEvents.slice();
      }).catch(() => this._snackBar.open("Impossible de récupérer les associations. Veuillez reéssayer plus tard", "fermer", {duration: 3000}));
  }

}
