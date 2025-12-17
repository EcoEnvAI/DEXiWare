import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'truncate',
    standalone: false
})
export class TruncatePipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform(input: string, length: number) : string {
        if (input.length > length) {
            return input.substring(0, length - 1) + "...";
        } else {
            return input;
        }
    }
}