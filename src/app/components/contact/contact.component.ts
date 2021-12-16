import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, UrlSegment} from "@angular/router";
import {Association} from "../../models/association";
import {AssociationService} from "../../services/association/association.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {


  uid: string | null = "";
  isPageRecruitement: boolean = false;
  association?: Association;
  currentAssociation: string = "" + this.router.snapshot.paramMap.get("uid");
  formGroup!: FormGroup;

  constructor(private formBuilder: FormBuilder,private router: ActivatedRoute, private associationService: AssociationService, private routerBis: Router) {
  }

  ngOnInit(): void {
    if (this.router.snapshot.url[0].path == "rejoindre")
      this.isPageRecruitement = true;
    if (history.state.data)
      this.association = history.state.data;
    else if (this.currentAssociation)
      this.getAssociationById();
    else
      this.routerBis.navigate(["/not-found"], {});
    this.initForm();
  }

  private getAssociationById() {
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

  onSubmit(): void {
    const value = this.formGroup.value;
    console.log(value);
    const nom: string = value["nom"];
    const prenom: string = value["prenom"];
    const ville: string = value["ville"];
    const tel: string = value["tel"];
    const object: string = value["object"];
    const message: string = value["message"];
    const email: string = value["email"];
    let headerEmail = "";
    if(!(nom == "" || prenom == "" || ville == "" || tel == ""))
      headerEmail = "Mes informations personnelles : %0A";
    if(nom)
      headerEmail = headerEmail+"Nom: "+nom+"%0A";
    if(prenom)
      headerEmail = headerEmail+"Prénom: "+prenom+"%0A";
    if(ville)
      headerEmail = headerEmail+"Ville: "+ville+"%0A";
    if(tel)
      headerEmail = headerEmail+"Numéro de téléphone: "+tel+"%0A";
    console.log(message);
    let open = "mailto:"+this.association?.contact+"?subject="+object+"&body="+headerEmail+"%0A%0A"+message.replace(/\r\n|\r|\n/g, "%0A");;
    window.open(open);
  }

  private initForm() {
    this.formGroup = this.formBuilder.group({
      nom: [""],
      prenom: [""],
      ville: [""],
      tel: [""],
      object: ["", Validators.required],
      message: ["", Validators.required],
      email: ["", Validators.email]
    });
  }
}

