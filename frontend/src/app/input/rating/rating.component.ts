import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../_services/api.service';

@Component({
    selector: 'true-rating',
    templateUrl: './rating.component.html',
    styleUrls: ['./rating.component.scss'],
    standalone: false
})
export class RatingComponent implements OnInit {
  @Input() assessmentId;
  @Input() indicator;
  @Input() pillar;
  @Output() prevClick: EventEmitter<any> = new EventEmitter();
  @Output() nextClick: EventEmitter<any> = new EventEmitter();
  @Output() updated: EventEmitter<any> = new EventEmitter();

  private RATING_COLORS: boolean = true;

  constructor(private api: ApiService) { }

  ngOnInit(): void {
  }

  transformClassname(classname) {
    return classname.toLowerCase().replace(" ", "-").replace("/", "-");
  }

  itemClass(threshold): string {
    let classname = this.pillar;

    if (this.RATING_COLORS) {
      classname += " " + this.transformClassname(threshold.color);
    } else {
      classname += " " + this.transformClassname(threshold.description.name);
    }
    
    let idx = this.indicator.Indicator_thresholds.findIndex((t) => t.id == threshold.id);
    let selectedIdx = this.indicator.Indicator_thresholds.findIndex((t) => t.value == this.indicator.value);

    if (idx == 0) {
      classname += " first";
    } else if (idx == this.indicator.Indicator_thresholds.length - 1) {
      classname += " last";
      if (idx == 1) {
        classname += " nomid";
      }
    } else if (idx == this.indicator.Indicator_thresholds.length - 2) {
      classname += " penultimate";
    }

    if (this.indicator.value === null || this.indicator.value === undefined) {
      if (idx == this.indicator.Indicator_thresholds.length - 1) {
        classname += ' notop';
      }
    } else {
      if (this.indicator.value == threshold.value) {
        classname += ' selected';
      } else {
        if (idx == 0) {
          classname += ' notselected';
        } else if (idx == this.indicator.Indicator_thresholds.length - 1) {
          classname += ' notselected notop';
        } else {
          classname += ' notselected';
          // prev selected
          if (selectedIdx == idx - 1) {
            classname += ' notop';
          }
          // next selected
          if (selectedIdx == idx + 1) {
            classname += ' nobottom';
          }
        }
      }
    }
    
   return classname;
  }

  nextClass(): string {
    return "enabled";
  }

  prevClass(): string {
    return "enabled";
  }

  select(threshold): void {
    if (this.indicator.value == threshold.value) {
      this.indicator.value = null;
    } else {
      this.indicator.value = threshold.value;
    }
    
    this.api.submitAssessmentIndicator(this.assessmentId, this.indicator.id, this.indicator.value).subscribe((ret) => {
      if (!ret) {
        alert("Error.");
      } else {
        this.updated.emit();
      }
    });
  }

  next(): void {
    this.nextClick.emit();
  }

  prev(): void {
    this.prevClick.emit();
  }

  chop(input:string): string {
    let cutoff = 60;
    if (input && input.length > cutoff) {
      return input.substring(0, cutoff - 1) + "...";
    } else {
      return input;
    }
  }
}
