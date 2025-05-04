import { Component, OnInit } from '@angular/core';
import { ColorService, GradientColors } from '../services/color.service';
import { CommonModule } from '@angular/common';
import { error } from 'console';
import { SlugService } from '../services/slug.service';
import { filter, switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-landing-background',
  imports: [CommonModule],
  templateUrl: './landing-background.component.html',
  styleUrl: './landing-background.component.css'
})
export class LandingBackgroundComponent implements OnInit{
  gradientStyle = '';

  constructor(
    private colorService: ColorService,
    private slugService: SlugService,
  ) {}

  ngOnInit() {
    this.slugService.slug$
    .pipe(
      filter(slug => slug !== null), // ✅ skip only null, allow empty string ''
      switchMap(slug => this.colorService.getGradientColors(slug!))
    )
    .subscribe(colors => {
      this.gradientStyle = `radial-gradient(circle at 50% 130%, #${colors.color1} ${colors.position1}%, #${colors.color2} ${colors.position2}%, #${colors.color3} ${colors.position3}%)`;
      console.log('Gradient style: ', this.gradientStyle);
    });
  }
}
