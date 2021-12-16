import { Component, OnInit } from '@angular/core';
import { Event as RehistEvent } from "../../models/event";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UnitType} from "../../models/unit-type";
import {EventService} from "../../services/event/event.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import { StorageService } from 'src/app/services/storage/storage.service';
import {Router} from "@angular/router";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {faFacebookF, faInstagram, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {map, startWith} from "rxjs/operators";
import {Observable} from "rxjs";
import {AddressService} from "../../services/geolocation/address.service";
import {Period} from "../../models/period";

@Component({
  selector: 'app-update-event',
  templateUrl: './update-event.component.html',
  styleUrls: ['./update-event.component.css']
})
export class UpdateEventComponent implements OnInit {

  unitTypeValues = Object.values(UnitType) as string[];
  periodValues = Object.values(Period) as string[];

  updateForm!: FormGroup;
  event: RehistEvent = history.state.data;
  addressData: string[] = [];

  isUploadingLogo = false;
  isUploadingBanner = false;

  allTypes: string[] = ['Bataille', 'Défilé', 'Marché', 'Spectacle'];
  types: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  typeCtrl = new FormControl();
  filteredType: Observable<string[]>;

  faTwitter = faTwitter;
  faFacebookF = faFacebookF;
  faYoutube = faYoutube;
  faInstagram = faInstagram;
  selectable = true;
  removable = true;
  isreserved = false;

  listOfAccessibilities: string[] = this.event?.accessibilities.split(',');

  logoUrl = this.event?.logo ? this.event?.logo : "";
  private logoFile?: File;

  bannerUrl = this.event?.banner ? this.event?.banner : "";
  private bannerFile?: File;

  constructor(private formBuilder: FormBuilder,
              private eventService: EventService,
              private storageService: StorageService,
              private addressService: AddressService,
              private _snackBar: MatSnackBar,
              private router: Router) {

    this.filteredType = this.typeCtrl.valueChanges.pipe(
      startWith(null),
      map((t: string | null) => (t ? this._filter(t) : this.allTypes.slice())),
    );
  }

  ngOnInit(): void {
    if(this.event == undefined)
      this.router.navigate(["/myAssociations"]);
    if(this.event && this.event.types_of_event)
      this.types = this.event.types_of_event.split(',');
    this.initForm();
  }

  private initForm() {
    this.updateForm = this.formBuilder.group({
        name: [this.event.name, Validators.required],
        slogan: this.event.slogan,
        type_of_event: this.types.join(','),
        period: this.event.period,
        address: [this.event.address, Validators.required],
        reservation_link: this.event.reservation_Link,
       //associations_presents: [this.event.associations_presents],
        description: [this.event.description, Validators.required],
        volunteer: [this.event.volunteer, Validators.min(0)],
        unitType: [this.event.unitType],
        isFree: this.event.isFree,
        program: this.event.program,
        price: this.formBuilder.array([]),
        age: this.formBuilder.array([]),
        youtube: this.event.social_network[0],
        facebook: this.event.social_network[1],
        instagram: this.event.social_network[2],
        twitter: this.event.social_network[3],
        web: this.event.web,
        accessibilities: [this.listOfAccessibilities],
        date_begin: this.event.date_begin,
        date_end: this.event.date_end,
        trailer: this.event.trailer,
        email: ["", Validators.email],
        phone: ["", Validators.pattern("[0-9]{10}")]
      });

    this.initPricePerAgeFrom();
  }

  private initPricePerAgeFrom() {
    let prices: FormArray = (this.updateForm.get("price") as FormArray);
    let ages: FormArray = (this.updateForm.get("age") as FormArray);
    this.event.price_per_age.forEach((ppa) => {
      let arrayPpa = ppa.split(":");

      prices.push(this.formBuilder.control(arrayPpa[0]));
      ages.push(this.formBuilder.control(arrayPpa[1]));
    })

  }

  onSubmit(): void {
    const value = this.updateForm.value;

    this.event.name= value['name'];
    this.event.slogan = value['slogan'];
    this.event.types_of_event = this.types.join(',');
    this.event.period = value['period'];
    this.event.address = value['address'];
    this.event.reservation_Link = value['reservation_link'];
    //const associations_presents:string[] = [""];
    this.event.description = value['description'];
    this.event.volunteer = value['volunteer'];
    this.event.unitType = value["unitType"];
    this.event.isFree = value['isFree'];
    this.event.program = value['program'];
    const prices: string[] = value['price'];
    const ages: string[] = value['age'];
    this.event.social_network = [value["youtube"], value['facebook'], value['instagram'], value['twitter']];
    this.event.web = value['web'];
    this.event.accessibilities = value['accessibilities'].join(',');
    this.event.date_begin = value['date_begin'];
    this.event.date_end = value['date_end'];
    this.event.trailer = value['trailer'];

    let price_per_age: string[] = [];

    if((this.updateForm.get('age') as FormArray).enabled) {
      for (let i = 0; i < ages.length; i++) {
        price_per_age.push(prices[i] + " : " + ages[i]);
      }
    }
    this.event.price_per_age = price_per_age;

    this.upload(this.event.name).then(
      () => {
        this.eventService.updateEvent(this.event)
          .then(
            (snapshot) => {
              this._snackBar.open("Votre événement " + this.event.name + " a bien été modifié !", "fermer", {duration: 3000,});
              this.router.navigate(["/event/", this.event.uid]);
            })
          .catch(
            (result) => {
              console.error("unable to add evenement : " + result);
              this._snackBar.open("Impossible de modifier cet événement... Veuillez réessayer plus tard.", "fermer",
                {
                  duration: 3000,
                  panelClass: ["mat-toolbar", "mat-warn"]
                });
            });
      });
  }

  onUploadLogo(event: Event) {
    const element = event.target as HTMLInputElement;
    if(element.files && element.files.length > 0)
      this.logoFile =  element.files[0];
  }

  onUploadBanner(event: Event) {
    const element = event.target as HTMLInputElement;
    if(element.files && element.files.length > 0)
      this.bannerFile =  element.files[0];
  }

  private uploadLogo() {
    return new Promise<void>((resolve, reject) => {
      this.isUploadingLogo = true;

      if(this.logoFile) {
        this.storageService.uploadFile(this.logoFile, "events/logos")
          .then(
            (snapshot) => {
              const imgStorageLocation = snapshot.metadata.fullPath;
              this.storageService.getUrlFromStoragePath(imgStorageLocation)
                .then((url) => {
                  this.logoUrl = url;
                  this.isUploadingLogo = false;
                  resolve();
                })
                .catch(reason => {
                  console.error("Unable to get logo url : " + reason);
                  this.isUploadingLogo = false;
                  reject(reason)
                });
            })
          .catch(reason => {
            console.error("Unable to upload logo : " + reason);
            this.isUploadingLogo = false;
            reject(reason);
          });
      }

    })

  }

  private uploadBanner() {
    return new Promise<void>((resolve, reject) => {
      this.isUploadingBanner = true;

      if(this.bannerFile) {
        this.storageService.uploadFile(this.bannerFile, "events/banners")
          .then(
            (snapshot) => {
              const imgStorageLocation = snapshot.metadata.fullPath;
              this.storageService.getUrlFromStoragePath(imgStorageLocation)
                .then((url) => {
                  this.bannerUrl = url;
                  this.isUploadingBanner = false;
                  resolve();
                })
                .catch((reason) => {
                  this.isUploadingBanner = false;
                  console.error("Unable to get banner url : " + reason);
                  reject(reason);
                });
            })
          .catch((reason) => {
            this.isUploadingBanner = false;
            console.error("Unable to upload banner : " + reason);
            reject(reason);
          });
      }
    });

  }

  private async upload(name: string) {
    return new Promise<void>(async (resolve) => {
      console.log("logo url : "+this.logoFile?.name);
      if(this.logoFile)
        await this.uploadLogo();
      if(this.bannerFile)
        await this.uploadBanner();
      resolve();
    });
  }

  getPrice(): FormArray {
    return this.updateForm.get('price') as FormArray;
  }

  getAge(): FormArray {
    return this.updateForm.get('age') as FormArray;
  }

  onAddPricePerAge() {
    const newPrice = this.formBuilder.control("");
    const newAge = this.formBuilder.control("");
    this.getPrice().push(newPrice);
    this.getAge().push(newAge);
  }

  onCheckedAccessibilities(event:MatCheckboxChange) {
    if(event.checked) {
      this.listOfAccessibilities.push(event.source.value);
    } else {
      for(let i = 0; i<this.listOfAccessibilities.length; i++) {
        if(this.listOfAccessibilities[i] == event.source.value)
          this.listOfAccessibilities.splice(i, 1);
      }
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
                this.addressData.push(properties.name + ", " + properties.postcode + ", " + properties.city);
              });
          })
        .catch(error => console.error(error))
    } else {
      this.addressData = [];
    }
  }

  onDeleteField(num: number) {
    let price = this.updateForm.get('price') as FormArray;
    let age = this.updateForm.get('age') as FormArray;

    price.removeAt(num);
    age.removeAt(num);
  }

  isFree(rep: boolean) {
    this.event.isFree = rep;
    if(this.event.isFree) {
      if(this.getAge().length === 0)
        this.onAddPricePerAge();

      (this.updateForm.get("price") as FormGroup).enable();
      (this.updateForm.get("age") as FormGroup).enable();
    } else {
      (this.updateForm.get("price") as FormGroup).disable();
      (this.updateForm.get("age") as FormGroup).disable();
    }
  }

  isReserved(rep: boolean) {
    this.isreserved = rep;
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.types.push(value);
    }
    event.chipInput!.clear();
    this.typeCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.types.indexOf(fruit);
    if (index >= 0) {
      this.types.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.types.push(event.option.viewValue);
    //this.fruitInput.nativeElement.value = '';
    this.typeCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTypes.filter(t => t.toLowerCase().includes(filterValue));
  }
}
