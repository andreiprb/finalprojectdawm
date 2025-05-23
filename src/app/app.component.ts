import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'DAWM Final Project';
  isLoading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
}
