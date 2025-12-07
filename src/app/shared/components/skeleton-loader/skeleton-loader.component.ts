import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss']
})
export class SkeletonLoaderComponent {
  @Input() type: 'card' | 'list' | 'avatar' | 'text' | 'form' = 'card';
  @Input() count: number = 3;
  @Input() animated: boolean = true;

  get items(): number[] {
    return Array(this.count).fill(0);
  }
}
