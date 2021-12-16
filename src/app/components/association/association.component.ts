import { Component, OnInit } from '@angular/core';
import {Association} from "../../models/association";
import {AssociationService} from "../../services/association/association.service";
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import {DocumentSnapshot} from 'firebase/firestore';
import {UnitType} from "../../models/unit-type";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-association',
  templateUrl: './association.component.html',
  styleUrls: ['./association.component.css']
})
export class AssociationComponent implements OnInit {
  association?: Association ;
  faTwitter = faTwitter;
  faFacebookF = faFacebookF;
  faYoutube = faYoutube;
  faInstagram = faInstagram;

  currentAssociation = this.router.snapshot.paramMap.get("uid");

  constructor(private associationService : AssociationService,
              private router: ActivatedRoute, private routerBis: Router) {

  }

  ngOnInit(): void {
    this.getAssociation();
  }

  private getAssociation() {
    if(this.currentAssociation) {
      this.associationService.getAssociationById(this.currentAssociation)
        .then((docsnaphot) => {
          let data = docsnaphot.data();
          if (data) {
            this.association = data;
            this.association.uid = docsnaphot.id;
          }
        })
        .catch(reason => console.error("Erreur get association " + reason));
    }
  }

  onClickPage(page: string) {
    let url = page+this.association?.uid;
    this.routerBis.navigate([url],  {state: {data: this.association}});
  }
}
