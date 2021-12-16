import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {NotFoundComponent} from "./components/not-found/not-found.component";
import {EventComponent} from "./components/event/event.component";
import {AssociationComponent} from "./components/association/association.component";
import {SignUpComponent} from "./components/authentification/sign-up/sign-up.component";
import {CreateEventComponent} from "./components/create-event/create-event.component";
import {SignInComponent} from "./components/authentification/sign-in/sign-in.component";
import {ResetPasswordComponent} from "./components/authentification/reset-password/reset-password.component";
import {AssociationCreationComponent} from "./components/association-creation/association-creation.component";
import {AuthGuard} from "./services/guard/auth.guard";
import {MesAssociationsComponent} from "./components/mes-associations/mes-associations.component";
import {PortfolioComponent} from "./components/portfolio/portfolio.component";
import {MesEvenementsComponent} from "./components/mes-evenements/mes-evenements.component";
import {ContactComponent} from "./components/contact/contact.component";
import {SettingsComponent} from "./components/settings/settings.component";
import {UpdateAssociationComponent} from "./components/update-association/update-association.component";
import {AssociationAllComponent} from "./components/association-all/association-all.component";
import {EventAllComponent} from "./components/event-all/event-all.component";
import {UpdateEventComponent} from "./components/update-event/update-event.component";


const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'home', component: HomeComponent},
  {path: 'association/:uid', component: AssociationComponent},
  {path: 'event/:uid', component: EventComponent},
  {path: 'associations', component: AssociationAllComponent},
  {path: 'events', component: EventAllComponent},
  {path: 'sign-up', component: SignUpComponent},
  {path: 'sign-in', component: SignInComponent},
  {path: 'reset-password', component: ResetPasswordComponent},
  {path: 'contacter/:uid', component: ContactComponent},
  {path: 'rejoindre/:uid', component: ContactComponent},
  {path: 'portfolio/:uid', component: PortfolioComponent},
  {path: 'createEvent', canActivate:[AuthGuard], component: CreateEventComponent},
  {path: 'createAssociation', canActivate: [AuthGuard], component: AssociationCreationComponent},
  {path: 'updateAssociation', canActivate:[AuthGuard], component: UpdateAssociationComponent},
  {path: 'updateEvent', canActivate:[AuthGuard], component: UpdateEventComponent},
  {path: 'myAssociations', canActivate: [AuthGuard], component: MesAssociationsComponent},
  {path: 'myEvents', canActivate: [AuthGuard], component: MesEvenementsComponent},
  {path: "settings", canActivate: [AuthGuard], component: SettingsComponent},
  {path: 'not-found', component: NotFoundComponent},
  {path: '**', redirectTo: '/not-found', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
