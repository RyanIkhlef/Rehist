import { Injectable } from '@angular/core';
import {resolve} from "@angular/compiler-cli/src/ngtsc/file_system";

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private static ADDRESS_API_URL = "https://api-adresse.data.gouv.fr/";

  constructor() { }

  getAddressByLatAndLng(latitude: number, longitude: number) {
    const url = AddressService.ADDRESS_API_URL + "reverse/?lon=" + longitude + "&lat=" + latitude;
    return new Promise<any>((resolve, reject) => {
      fetch(url)
        .then((response) => {
          if (response.ok) {
            resolve(response.json());
          } else {
            reject(response);
          }
        }).catch(error => reject(error));
    });
  }

  getAddressByCity(city: string) {
    const url = AddressService.ADDRESS_API_URL + "search/?q=" + city;
    return new Promise<any>((resolve, reject) => {
      fetch(url)
        .then((response) => {
          if(response.ok) {
            response.json().then((res) => {
              resolve(res);
            }).catch(error => console.error("unable to get address by city : " + city + "Error : " + error));
          } else {
            reject(response);
          }
        }).catch(error => reject(error));
    })
  }

  getAddress(address: string) {
    const url = AddressService.ADDRESS_API_URL + "search/?q=" + address;
    return new Promise<any[]>((resolve, reject) => {
      fetch(url)
        .then((response) => {
          if(response.ok) {
            response.json().then((res) => {
              resolve(res.features);
            }).catch(error => reject(error));
          }
          else {
            reject(response);
          }
        })
        .catch(error => reject(error));
    });
  }

  getDistanceBetween(latitudeA: number, longitudeA: number , latitudeB: number, longitudeB: number) {
    const earthRadiusKm = 6371;

    const dLat = this.degreesToRadians(latitudeB - latitudeA);
    const dLon = this.degreesToRadians(longitudeB - longitudeA);

    let lat1 = this.degreesToRadians(latitudeA);
    let lat2 = this.degreesToRadians(latitudeB);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
  }


  private degreesToRadians(degrees: number) {
    return degrees * Math.PI / 180;
  }
}
