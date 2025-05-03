import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ColorService, GradientColors } from '../services/color.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-landing-background',
  imports: [CommonModule],
  templateUrl: './landing-background.component.html',
  styleUrl: './landing-background.component.css'
})
export class LandingBackgroundComponent {
  gradientStyle = '';

  constructor(
    private colorService: ColorService,
    private router: Router
  ) {}
  ngOnInit() {
    const path = this.router.url.replace(/^\/+|\/+$/g, ''); 
    this.colorService.getGradientColors(path).subscribe((colors: GradientColors) => {
      this.gradientStyle = `radial-gradient(circle at 50% 130%, ${colors.color1} ${colors.position1}%, ${colors.color2} ${colors.position2}%, ${colors.color3} ${colors.position3}%)`;
    });
  }

}
