import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import {Association} from "../../models/association";
import {AssociationService} from "../../services/association/association.service";
import {ActivatedRoute, Route, Router} from "@angular/router";
import {PortfolioService} from "../../services/portFolio/portfolio.service";
import {Portfolio} from "../../models/portfolio";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {MatSelectChange} from "@angular/material/select";
import {DomSanitizer} from "@angular/platform-browser";
import {UserService} from "../../services/user/user.service";
import {User} from "../../models/user";
import {getAuth} from "firebase/auth";
import {MatDialog} from "@angular/material/dialog";
import {DialogPortfolioComponent} from "../dialog-portfolio/dialog-portfolio.component";
import {DialogPortfolioAddComponent} from "../dialog-portfolio-add/dialog-portfolio-add.component";
import {StorageService} from "../../services/storage/storage.service";

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  association?: Association;
  currentAssociation: string = "" + this.router.snapshot.paramMap.get("uid");
  allMedias: Portfolio[] = [];
  allMediasDisplay: Portfolio[] = [];
  photo: boolean = true;
  video: boolean = true;
  isCreator: boolean = false;
  isUploading: boolean = false;

  constructor(private associationService: AssociationService,
              private router: ActivatedRoute, private portfolioService: PortfolioService,
              private _snackBar: MatSnackBar, private routerBis: Router, private userService: UserService,
              public dialog: MatDialog,private storageService: StorageService) {
  }

  ngOnInit(): void {
    if (history.state.data) {
      this.association = history.state.data;
      this.isCreator = this.isCreatorF();
      this.getAllMedias(this.currentAssociation);
    } else if (this.currentAssociation)
      this.getAssociationById();
    getAuth().onAuthStateChanged((user) => {
      this.isCreator = !!user;
      this.userService.setCurrentUser();
    });
  }

  isCreatorF(): boolean {
    return this.userService.currentConnectedUser?.uid === this.association?.id_user;
  }

  getAssociationById() {
    this.associationService.getAssociationById(this.currentAssociation)
      .then((docsnaphot) => {
        let data = docsnaphot.data();
        if (data) {
          this.association = data;
          this.association.uid = docsnaphot.id;
          this.getAllMedias("" + this.association?.uid);
          setTimeout(() => {
            this.isCreator = this.isCreatorF();
          }, 300);
        } else
          this.routerBis.navigate(["/not-found"], {});
      })
      .catch(reason => {
        console.error("Erreur get association " + reason);
      });
  }

  private getAllMedias(numAssos: string) {
    this.portfolioService.getAllMediasByAssos(numAssos)
      .then(
        (querySnapshot) => {
          querySnapshot.forEach(snapshot => {
            let media = snapshot.data();
            media.uid = snapshot.id;
            this.allMedias.push(media);
          });
          this.allMediasDisplay = this.allMedias;
          this.trie("ASC");
        }
      )
      .catch(reason => console.error("Erreur get association " + reason));
  }

  toogleChange(event: MatSlideToggleChange) {
    if (event.source.name === "photo")
      this.photo = event.checked;
    if (event.source.name === "video")
      this.video = event.checked;

    this.allMediasDisplay = this.allMedias.filter((element) => {
      if ((this.photo && element.type === "photo") || (this.video && element.type === "video"))
        return true;
      return false
    });
  }

  trie(value: string) {
    this.allMediasDisplay.sort((element1: Portfolio, element2: Portfolio) => {
      if (value === "DESC")
        return element1.published.getTime() - element2.published.getTime();
      else
        return element2.published.getTime() - element1.published.getTime();
    });
  }

  deleteMedia(media: Portfolio) {
    this.portfolioService.deleteMedia(media);
    for(let i = 0; i<this.allMedias.length; i++)
      if(this.allMedias[i].uid == media.uid)
        this.allMedias.splice(i, 1);
  }

  openDialog(media: Portfolio) {
    const dialogRef = this.dialog.open(DialogPortfolioComponent, {
      data: {
        titre: media.titre,
        date: media.date,
        lieu: media.lieu,
        media: media
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.media.titre = result.titre;
        result.media.date = result.date;
        result.media.lieu = result.lieu;
        this.portfolioService.updateMedia(media);
      }
    });
  }

  addPortfolio() {
    const dialogRef = this.dialog.open(DialogPortfolioAddComponent, {
      data: {
        titre: "",
        date: null,
        lieu: "",
        urlVideo: "",
        urlPhoto: null,
        selectedValue: ""
      }
    });
    dialogRef.beforeClosed().subscribe(async result => {
      if (result && this.association?.uid) {
        let media = new Portfolio(this.association.uid, result.selectedValue, result.titre, result.lieu, new Date(), "", result.date);
        if(result.selectedValue == 'photo') {
          this.isUploading = true;
          await this.uploadLogo(result.urlPhoto, media).then(() => {
            this.portfolioService.addMedia(media).then(() => {
              this._snackBar.open("Votre media a été publié, Félicitations !", "fermer", {duration: 3000});
              this.isUploading = false;
              this.allMedias.push(media);
              this.trie("");
            });
          }).catch((reason) => {
            this._snackBar.open("Impossible de publier votre média", "nous contacter", {duration: 5000});
          });
        } else {
          var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
          var match = result.urlVideo.match(regExp);
          if(match&&match[7].length==11) {
            console.log(match[7]);
            media.lien = "https://www.youtube.com/embed/"+match[7];
            console.log(media.lien);
            this.portfolioService.addMedia(media).then(() => {
              this._snackBar.open("Votre media a été publié, Félicitations !", "fermer", {duration: 3000});
              this.isUploading = false;
              this.allMedias.push(media);
              this.trie("");
            });
          } else {
            this._snackBar.open("Vous n'avez pas inséré une vidéo youtube", "fermer", {duration: 3000});
            this.isUploading = false;
          }
        }
      }
    });
  }

  private uploadLogo(file: File, media:Portfolio) {
    return new Promise<void>((resolve, reject) => {
      console.log("upload");
      if(file) {
        this.storageService.uploadFile(file, "associations/portfolio")
          .then(
            (snapshot) => {
              const imgStorageLocation = snapshot.metadata.fullPath;
              this.storageService.getUrlFromStoragePath(imgStorageLocation)
                .then((url) => {
                  media.lien = url;
                  resolve();
                })
                .catch(reason => {
                  console.error("Unable to get logo url : " + reason);
                  this.isUploading = false;
                  this._snackBar.open("Votre media n'a pas pu être récupéré", "fermer", {duration: 3000});
                  reject(reason)
                });
            })
          .catch(reason => {
            console.error("Unable to upload logo : " + reason);
            this.isUploading = false;
            this._snackBar.open("Votre media n'a pas pu être enregistré", "fermer", {duration: 3000});
            reject(reason);
          });
      }

    })

  }


}
