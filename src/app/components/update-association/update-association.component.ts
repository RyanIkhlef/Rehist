import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Association} from 'src/app/models/association';
import {UnitType} from "../../models/unit-type";
import {StorageService} from "../../services/storage/storage.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserService} from "../../services/user/user.service";
import {AssociationService} from "../../services/association/association.service";
import {AddressService} from "../../services/geolocation/address.service";
import {Period} from "../../models/period";

@Component({
  selector: 'app-update-association',
  templateUrl: './update-association.component.html',
  styleUrls: ['./update-association.component.css']
})
export class UpdateAssociationComponent implements OnInit {

  updateForm!: FormGroup;
  association: Association = history.state.data;
  unitTypeValues = Object.values(UnitType) as string[];
  periodValues = Object.values(Period) as string[];
  addressData: string[] = [];
  isUploading = false;
  isUploadingLogo = false;
  isUploadingBanner = false;

  logoUrl = this.association?.logo ? this.association?.logo : "";
  private logoFile?: File;

  bannerUrl = this.association?.banner ? this.association?.banner : "";
  private bannerFile?: File;

  otherUrlList:string[] = [];
  private otherFileList?: FileList;

  constructor(private formBuilder: FormBuilder,
              private storageService: StorageService,
              private userService: UserService,
              private associationService: AssociationService,
              private addressService: AddressService,
              private router: Router,
              private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    if(this.association == undefined)
      this.router.navigate(["/myAssociations"]);
    else
      this.initForm();
  }

  private initForm() {
    const recruitment: string = String(this.association.recruitment);
    this.updateForm = this.formBuilder.group({
      name : [this.association.name, Validators.required],
      firstname: [this.association.leader_firstname, Validators.required],
      lastname: [this.association.leader_lastname, Validators.required],
      address: [this.association.address, Validators.required],
      slogan: this.association.slogan,
      description: [this.association.description, Validators.required],
      numberOfVolunteers: [this.association.volunteer, [Validators.required, Validators.min(0)]],
      unitType: [this.association.unitType],
      period: [this.association.period],
      socialNetworks: this.initSocialNetworks(),
      website: this.association.web,
      email: [this.association.contact, Validators.email],
      tel: [this.association.tel, Validators.pattern("[0-9]{10}")],
      recruitment: [recruitment, Validators.required],
      recruitmentCondition: this.association.conditions_recruitment
    })
  }

  private initSocialNetworks(): FormArray {
    let controls: FormControl[] = [];
    this.association.social_network?.forEach((link) => controls.push(this.formBuilder.control(link)))
    return this.formBuilder.array(controls);
  }

  getSocialNetworks(): FormArray {
    return this.updateForm.get('socialNetworks') as FormArray;
  }

  onAddSocialNetwork() {
    const newSocialNetwork = this.formBuilder.control("");
    this.getSocialNetworks().push(newSocialNetwork);
  }

  onSubmit(): void {
    const value = this.updateForm.value;

    this.association.name = value['name'];
    this.association.leader_firstname = value["firstname"];
    this.association.leader_lastname = value["lastname"];
    this.association.address =  value["address"];
    this.association.slogan = value["slogan"];
    this.association.description = value["description"];
    this.association.volunteer = value["numberOfVolunteers"];
    this.association.unitType = value["unitType"];
    this.association.period = value["period"];
    this.association.social_network = value["socialNetworks"];
    this.association.web = value["website"];
    this.association.contact = value["email"];
    this.association.tel = value["tel"];
    this.association.recruitment = value['recruitment'] === 'true';
    this.association.conditions_recruitment = value["recruitmentCondition"];


    this.upload(this.association.name).then(
      () => {
        this.associationService.updateAssociation(this.association)
          .then(
            () => {
              this._snackBar.open("Votre association " + name + " a bien été modifiée !", "fermer", {duration: 3000,});
              this.router.navigate(["/association", this.association.uid]);
            })
          .catch(
            (result) => {
              console.error("unable to add association : " + result);
              this._snackBar.open("Impossible de modifier cette association... Veuillez réessayer plus tard.", "fermer",
                {
                  duration: 3000,
                  panelClass: ["mat-toolbar", "mat-warn"]
                });
            });
      });
  }

  onUploadLogo(event: Event) {
    const element = event.target as HTMLInputElement;
    if(element.files && element.files.length > 0) {
      this.logoUrl = "";
      this.logoFile = element.files[0];
    }
  }

  onUploadBanner(event: Event) {
    const element = event.target as HTMLInputElement;
    if(element.files && element.files.length > 0) {
      this.bannerUrl = "";
      this.bannerFile = element.files[0];
    }
  }

  onUploadImagesAndVideos(event: Event) {
    const element = event.target as HTMLInputElement;
    if(element.files && element.files.length > 0)
      this.otherFileList =  element.files;
  }

  onAddressInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const content = target.value;
    if (content.length > 3) {
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
      if(this.bannerFile) {
        this.isUploadingBanner = true;
        this.storageService.uploadFile(this.bannerFile, "associations/banners")
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
