import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {StorageService} from "../../services/storage/storage.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {UserService} from "../../services/user/user.service";
import {EventService} from "../../services/event/event.service";
import {UnitType} from "../../models/unit-type";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {AddressService} from "../../services/geolocation/address.service";
import {Period} from "../../models/period";

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {

  unitTypeValues = Object.values(UnitType) as string[];
  periodValues = Object.values(Period) as string[];
  isfree:boolean = false;
  isreserved:boolean = false;
  fieldNumber?: number[] = [0];
  autoIncrement: number = 0;
  faTwitter = faTwitter;
  faFacebookF = faFacebookF;
  faYoutube = faYoutube;
  faInstagram = faInstagram;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  typeCtrl = new FormControl();
  filteredType: Observable<string[]>;
  types: string[] = ['Bivouac'];
  allTypes: string[] = ['Bataille', 'Défilé', 'Marché', 'Spectacle'];
  listOfAccessibilities: string[] = [];
  formGroup!: FormGroup;
  isUploading = false;
  isUploadingLogo = false;
  isUploadingBanner = false;
  logoUrl = "";
  private logoFile?: File;
  bannerUrl = "";
  private bannerFile?: File;
  otherUrlList:string[] = [];
  private otherFileList?: FileList;
  addressData: string[] = [];

  constructor(private formBuilder: FormBuilder,
              private eventService: EventService,
              private storageService: StorageService,
              private addressService: AddressService,
              private _snackBar: MatSnackBar,
              private router: Router,
              private userService: UserService) {
    this.filteredType = this.typeCtrl.valueChanges.pipe(
      startWith(null),
      map((t: string | null) => (t ? this._filter(t) : this.allTypes.slice())),
    );
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.formGroup = this.formBuilder.group({
      name: ["", Validators.required],
      slogan: "",
      type_of_event: "",
      period: "",
      address: ["", Validators.required],
      reservation_link: "",
      associations_presents: [""],
      description: ["", Validators.required],
      volunteer: [0, Validators.min(0)],
      unitType: [""],
      isFree: true,
      program: "",
      price: this.formBuilder.array([]),
      age: this.formBuilder.array([]),
      youtube: "",
      twitter: "",
      instagram: "",
      facebook: "",
      web: "",
      accessibilities: "",
      date_begin: 0,
      date_end: 0,
      trailer: "",
      email: ["", Validators.email],
      phone: ["", Validators.pattern("[0-9]{10}")]
    })
  }

  onSubmit(): void {
    const value = this.formGroup.value;
    const name:string = value['name'];
    const slogan: string = value['slogan'];
    let types_of_event: string = this.types.join(',');
    const period: string= value['period'];
    const address: string = value['address'];
    const reservation_link: string = value['reservation_link'];
    const associations_presents:string[] = [""];
    const description: string = value['description'].replace("\n", "<br />");
    const volunteer: number = value['volunteer'];
    const unitType: UnitType[] = value["unitType"];
    const isFree: boolean = value['isFree'];
    const program: string = value['program'].replace("\n", "<br />");
    const prices: string[] = value['price'];
    const ages: string[] = value['age'];
    let trailer: string = "";
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = (""+value["trailer"]).match(regExp);
    if(match&&match[7].length==11)
      trailer = "https://www.youtube.com/embed/"+match[7];
    const social_network:string[] = [value['youtube'], value['facebook'], value['instagram'], value['twitter']];
    const web: string = value['web'];
    let accessibilities: string = this.listOfAccessibilities.join(',');
    const date_begin: Date = value['date_begin'];
    const date_end: Date = value['date_end'];

    let price_per_age: string[] = [];

    if((this.formGroup.get('age') as FormArray).enabled) {
      for (let i = 0; i < ages.length; i++) {
        price_per_age.push(prices[i] + " : " + ages[i]);
      }
    }

    this.userService.setCurrentUser();
    const connectedUser = this.userService.currentConnectedUser;
    let id_user = ""

    if(connectedUser && connectedUser.uid) {
      id_user = connectedUser.uid;
    } else {
      this._snackBar.open("Vous devez être connecté pour créer une page !", "fermer",
        {
          duration: 3000,
          panelClass: ["mat-toolbar", "mat-warn"]
        })
      this.formGroup.setErrors({userNotConnected: true});
      this.router.navigate(["/sign-in"]);
      return;
    }

    this.upload(name).then(
      () => {
        this.eventService.addEvent(id_user,name, slogan,types_of_event,period,address,reservation_link,associations_presents,description,volunteer,unitType,isFree,program,price_per_age,social_network,web,accessibilities,date_begin,date_end,trailer,this.logoUrl,this.bannerUrl)
          .then(
            (snapshot) => {
              this._snackBar.open("Votre événement " + name + " a bien été crée !", "fermer", {duration: 3000,});
              this.router.navigate(["/event/", snapshot.id]);
            })
          .catch(
            (result) => {
              console.error("unable to add evenement : " + result);
              this._snackBar.open("Impossible d'ajouter cet événement... Veuillez réessayer plus tard.", "fermer",
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
    return this.formGroup.get('price') as FormArray;
  }

  getAge(): FormArray {
    return this.formGroup.get('age') as FormArray;
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
    console.log(this.listOfAccessibilities);
  }

  onInsertField() {
    this.autoIncrement++;
    this.fieldNumber?.push(this.autoIncrement);
  }

  onDeleteField(num: number) {
    let price = this.formGroup.get('price') as FormArray;
    let age = this.formGroup.get('age') as FormArray;

    price.removeAt(num);
    age.removeAt(num);
  }

  isFree(rep: boolean) {
    this.isfree = rep;
    if(this.isfree) {
      if(this.getAge().length === 0)
        this.onAddPricePerAge();

      (this.formGroup.get("price") as FormGroup).enable();
      (this.formGroup.get("age") as FormGroup).enable();
    } else {
      (this.formGroup.get("price") as FormGroup).disable();
      (this.formGroup.get("age") as FormGroup).disable();
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

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTypes.filter(t => t.toLowerCase().includes(filterValue));
  }

}
