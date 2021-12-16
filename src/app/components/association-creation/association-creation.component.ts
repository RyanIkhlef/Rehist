import { Component, OnInit } from '@angular/core';
import {UnitType} from "../../models/unit-type";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AssociationService} from "../../services/association/association.service";
import {StorageService} from "../../services/storage/storage.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {UserService} from "../../services/user/user.service";
import {AddressService} from "../../services/geolocation/address.service";
import {Period} from "../../models/period";

@Component({
  selector: 'app-association-creation',
  templateUrl: './association-creation.component.html',
  styleUrls: ['./association-creation.component.css']
})
export class AssociationCreationComponent implements OnInit {

  unitTypeValues = Object.values(UnitType) as string[];
  periodValues = Object.values(Period) as string[];
  volunteers = "false";
  formGroup!: FormGroup;
  addressData: string[] = [];
  isUploading = false;
  isUploadingLogo = false;
  isUploadingBanner = false;

  logoUrl = "";
  private logoFile?: File;

  bannerUrl = "";
  private bannerFile?: File;

  otherUrlList:string[] = [];
  private otherFileList?: FileList;

  constructor(private formBuilder: FormBuilder,
              private associationService: AssociationService,
              private storageService: StorageService,
              private addressService: AddressService,
              private _snackBar: MatSnackBar,
              private router: Router,
              private userService: UserService) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.formGroup = this.formBuilder.group({
      name: ["", [Validators.required, Validators.pattern("[^/]{0,}")]],
      firstname: ["", Validators.required],
      lastname: ["", Validators.required],
      address: ["", Validators.required],
      slogan: "",
      description: ["", Validators.required],
      numberOfVolunteers: [0, [Validators.required, Validators.min(0)]],
      unitType: [''],
      period: ["", [Validators.required]],
      socialNetworks: this.formBuilder.array([this.formBuilder.control("")]),
      website: "",
      email: ["", Validators.email],
      tel: ["", Validators.pattern("[0-9]{10}")],
      recruitment: ["false", Validators.required],
      recruitmentCondition: ""
    })
  }

  getSocialNetworks(): FormArray {
    return this.formGroup.get('socialNetworks') as FormArray;
  }

  onAddSocialNetwork() {
    const newSocialNetwork = this.formBuilder.control("");
    this.getSocialNetworks().push(newSocialNetwork);
  }

  onSubmit(): void {
    const value = this.formGroup.value;

    const name:string = value['name'];
    const firstname:string = value["firstname"];
    const lastname:string = value["lastname"];
    const address:string = value["address"];
    const slogan:string = value["slogan"];
    const description:string = value["description"];
    const numberOfVolunteers:number = value["numberOfVolunteers"];
    const unitType: UnitType[] = value["unitType"];
    const period:string = value["period"];
    const socialNetwork:string[] = value["socialNetworks"];
    const website:string = value["website"];
    const email:string = value["email"];
    const tel:string = value["tel"];
    const recruitment:boolean = value['recruitment'] === 'true';
    const recruitmentCondition:string = value["recruitmentCondition"];

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
        this.associationService.addAssociation(id_user, name, description, firstname, lastname, address, unitType, period, email, tel, socialNetwork,
          numberOfVolunteers, website, slogan, this.logoUrl, this.bannerUrl, recruitmentCondition, recruitment)
          .then(
            (snapshot) => {
              this._snackBar.open("Votre association " + name + " a bien été crée !", "fermer", {duration: 3000,});
              this.router.navigate(["/association", snapshot.id]);
            })
          .catch(
            (result) => {
              console.error("unable to add association : " + result);
              this._snackBar.open("Impossible d'ajouter cette association... Veuillez réessayer plus tard.", "fermer",
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

  onUploadImagesAndVideos(event: Event) {
    const element = event.target as HTMLInputElement;
    if(element.files && element.files.length > 0)
      this.otherFileList =  element.files;
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

  private uploadLogo() {
    return new Promise<void>((resolve, reject) => {

      if(this.logoFile) {
        this.isUploadingLogo = true;
        this.storageService.uploadFile(this.logoFile, "associations/logos")
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
      } else
        resolve();
    })

  }

  private uploadBanner() {
    return new Promise<void>((resolve, reject) => {
      console.log("upload banner");
      if(this.bannerFile) {
        this.isUploadingBanner = true;
        console.log("banner not undefined : " + this.bannerFile );
        this.storageService.uploadFile(this.bannerFile, "associations/banners")
          .then(
            (snapshot) => {
              const imgStorageLocation = snapshot.metadata.fullPath;
              this.storageService.getUrlFromStoragePath(imgStorageLocation)
                .then((url) => {
                  this.bannerUrl = url;
                  console.log("banner uploaded");
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
      } else
        resolve();
    });

  }

  private uploadImagesAndVideos(name: string) {
    return new Promise<void>((resolve, reject) => {
      if(this.otherFileList) {
        this.isUploading = true;
        for(let index = 0; index < this.otherFileList.length; index++) {
          let file = this.otherFileList[index];
          this.storageService.uploadFile(file, "associations/other/" + name)
            .then(
              (snapshot) => {
                const fileStorageLocation = snapshot.metadata.fullPath;
                this.storageService.getUrlFromStoragePath(fileStorageLocation)
                  .then((url) => this.otherUrlList.push(url))
                  .catch(reason => {
                    console.error("Unable to get url of " + fileStorageLocation + " : " + reason);
                    this.isUploading = false;
                    reject(reason);
                  });
                this.isUploading = false;
                resolve();
              })
            .catch(reason => {
              console.error("Unable to upload file : " + reason);
              this.isUploading = false;
              reject(reason);
            });
        }
      } else
        resolve();
    });
  }

  private async upload(name: string) {
    return new Promise<void>(async (resolve) => {
      await this.uploadLogo();
      await this.uploadBanner();
      await this.uploadImagesAndVideos(name);
      resolve();
    });

  }
}
