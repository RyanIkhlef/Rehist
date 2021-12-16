import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PortfolioService} from "../../services/portFolio/portfolio.service";
import { faYoutube } from '@fortawesome/free-brands-svg-icons';

export interface DialogData {
  titre: string;
  date: Date;
  lieu: string;
  urlVideo: string;
  urlPhoto: File;
  selectedValue: string;
}


@Component({
  selector: 'app-dialog-portfolio-add',
  templateUrl: './dialog-portfolio-add.component.html',
  styleUrls: ['./dialog-portfolio-add.component.css']
})
export class DialogPortfolioAddComponent {

  selected: string = "";
  faYoutube = faYoutube;

  constructor(public dialogRef: MatDialogRef<DialogPortfolioAddComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData, private portfolioService: PortfolioService) { }

  close() {
    this.dialogRef.close();
  }

  uploadImg(event: Event, data: DialogData) {
    const element = event.target as HTMLInputElement;
    if(element.files && element.files.length > 0)
      data.urlPhoto =  element.files[0];
  }
}
