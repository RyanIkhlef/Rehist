import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Portfolio} from "../../models/portfolio";
import {PortfolioService} from "../../services/portFolio/portfolio.service";

export interface DialogData {
  titre: string;
  date: Date;
  lieu: string;
}

@Component({
  selector: 'dialog-portfolio-component',
  templateUrl: 'dialog-portfolio.component.html',
  styleUrls: ['dialog-portfolio.component.css']
})
export class DialogPortfolioComponent {
  constructor(public dialogRef: MatDialogRef<DialogPortfolioComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData, private portfolioService: PortfolioService,) {
  }

  close() {
    this.dialogRef.close();
  }
}


