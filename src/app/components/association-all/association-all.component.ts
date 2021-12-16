import { Component, OnInit } from '@angular/core';
import {UnitType} from "../../models/unit-type";
import {Association} from "../../models/association";
import {AssociationService} from "../../services/association/association.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatSelectChange} from "@angular/material/select";
import {NgForm} from "@angular/forms";
import {AddressService} from "../../services/geolocation/address.service";
import {Period} from "../../models/period";

@Component({
  selector: 'app-association-details',
  templateUrl: './association-all.component.html',
  styleUrls: ['./association-all.component.css']
})
export class AssociationAllComponent implements OnInit {

  maxDist = 50;

  unitTypeValues = Object.values(UnitType) as string[];
  periodValues = Object.values(Period) as string[];
  associations: Association[] = [];
  allAssociations: Association[] = [];

  locationSelected = "";
  numberOfVolunteers = "moreThan";
  manualGeolocation: boolean = false;

  latitude?: number;
  longitude?: number;
  userCity?: string;

  searchContent: string = "";
  unitSelected: UnitType[] = [];
  volunteerContent = 0;
  periodSelected = "";
  addressData: string[] = [];

  constructor(private associationService: AssociationService,
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

  onSearchByPeriod(event: MatSelectChange) {
    const content = event.source.value;
    if(content.length >= 1 && content[0] != "") {
      this.filter();
    }
  }

  onComparisonChange(value: string) {
    const valueNumber = parseInt(value);
    if(!isNaN(valueNumber))
      this.filter();
  }


  onSearchByVolunteer(event: Event) {
    const content = parseInt((event.target as HTMLInputElement).value);
    if(!isNaN(content)) {
        this.filter();
    }
  }

  onResetForm(searchForm: NgForm) {
    searchForm.resetForm();
    this.manualGeolocation = false;
    this.longitude = undefined;
    this.latitude = undefined;
    this.associations = this.allAssociations.slice();
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
        this.searchByPosition();
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
    this.associations = this.allAssociations.slice();

    this.search();
    this.searchByUnitType();
    this.searchByPeriod();
    this.searchByVolunteer();
    this.searchByPosition();
  }

  private search() {
    if(this.searchContent != null) {
      this.associations = this.associations.filter((association) => {
        return association.name.toUpperCase().includes(this.searchContent.toUpperCase());
      });
    }
  }

  private searchByUnitType() {
    if(this.unitSelected && this.unitSelected.length > 0) {
      this.associations = this.associations.filter((association) => {
        return this.unitSelected.some(unit => association.unitType.includes(unit));
      });
    }
  }

  private searchByPeriod() {
    if(this.periodSelected && this.periodSelected != "")
    this.associations = this.associations.filter((association) => {
      return this.periodSelected === association.period;
    });
  }

  private searchByVolunteer() {
    if(this.volunteerContent > 0) {
      this.associations = this.associations.filter((association) => {
        if (!association.volunteer)
          return false;
        if (this.numberOfVolunteers === "moreThan")
          return this.volunteerContent <= association.volunteer;
        else if (this.numberOfVolunteers === "lessThan")
          return this.volunteerContent >= association.volunteer;

        return false;
      });
    }
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
      let tmpAssociationList: Association[] = [];
      for (const association of this.associations) {
        const associationCity = association.address.split(',')[2];
        let distance = this.maxDist * 2;
        if (associationCity) {
          distance = await this.getDistance(associationCity);
          console.log(associationCity + " : " + distance);
        }
        if (distance <= this.maxDist)
          tmpAssociationList.push(association);
      }
      this.associations = tmpAssociationList.slice();
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
    this.associationService.getAssociations()
      .then((querySnapshot) => {
        querySnapshot.forEach((snapshot) => {
          let association = snapshot.data();
          association.uid = snapshot.id;
          this.allAssociations.push(association);
        })
        this.associations = this.allAssociations.slice();
      }).catch(() => this._snackBar.open("Impossible de récupérer les associations. Veuillez reéssayer plus tard", "fermer", {duration: 3000}));
  }

}
