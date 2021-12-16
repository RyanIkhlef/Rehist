import { Component } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Rehist';

  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyDnduH88A6Wa-WwMIfKxfl--rFvx4Cx8o4",
      authDomain: "rehist-56806.firebaseapp.com",
      databaseURL: "https://rehist-56806-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "rehist-56806",
      storageBucket: "rehist-56806.appspot.com",
      messagingSenderId: "59763426729",
      appId: "1:59763426729:web:aa82cf68293b91425db0b8",
      measurementId: "G-5V2M9T387F"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
  }
}

