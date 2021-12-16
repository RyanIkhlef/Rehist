import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/main/app/app.component';
import { HomeComponent } from './components/home/home.component';
import { NavComponent } from './components/main/nav/nav.component';
import {MatMenuModule} from "@angular/material/menu";
import { NotFoundComponent } from './components/not-found/not-found.component';
import { EventComponent } from './components/event/event.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from "@angular/material/card";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FlexLayoutModule } from "@angular/flex-layout";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { AssociationComponent } from './components/association/association.component';
import { SignUpComponent } from './components/authentification/sign-up/sign-up.component';
import { FooterComponent } from './components/main/footer/footer.component';
import { CreateEventComponent } from "./components/create-event/create-event.component";
import {MAT_DATE_LOCALE, MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { SignInComponent } from './components/authentification/sign-in/sign-in.component';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { ResetPasswordComponent } from './components/authentification/reset-password/reset-password.component';
import { AssociationCreationComponent } from './components/association-creation/association-creation.component';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {DynamicHooksModule} from "ngx-dynamic-hooks";
import {MatChipsModule} from "@angular/material/chips";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatStepperModule} from "@angular/material/stepper";
import { MesAssociationsComponent } from './components/mes-associations/mes-associations.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import { MesEvenementsComponent } from './components/mes-evenements/mes-evenements.component';
import { ContactComponent } from './components/contact/contact.component';
import { SettingsComponent } from './components/settings/settings.component';
import { UpdateAssociationComponent } from './components/update-association/update-association.component';
import { UpdateEventComponent } from './components/update-event/update-event.component';
import {SafePipe} from "./services/autre/SafePipe";
import { DialogPortfolioComponent } from './components/dialog-portfolio/dialog-portfolio.component';
import {MatDialogModule} from "@angular/material/dialog";
import { DialogPortfolioAddComponent } from './components/dialog-portfolio-add/dialog-portfolio-add.component';
import { AssociationAllComponent } from './components/association-all/association-all.component';
import {MatSliderModule} from "@angular/material/slider";
import {EventAllComponent} from "./components/event-all/event-all.component";
import {AuthGuard} from "./services/guard/auth.guard";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent,
    NotFoundComponent,
    EventComponent,
    AssociationComponent,
    SignUpComponent,
    FooterComponent,
    CreateEventComponent,
    SignInComponent,
    ResetPasswordComponent,
    AssociationCreationComponent,
    MesAssociationsComponent,
    PortfolioComponent,
    MesEvenementsComponent,
    ContactComponent,
    SettingsComponent,
    UpdateAssociationComponent,
    UpdateEventComponent,
    UpdateAssociationComponent,
    SafePipe,
    DialogPortfolioComponent,
    DialogPortfolioAddComponent,
    AssociationAllComponent,
    EventAllComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatMenuModule,
    FontAwesomeModule,
    MatOptionModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    FormsModule,
    MatProgressSpinnerModule,
    DynamicHooksModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSliderModule
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(faChevronRight)
  }
}
