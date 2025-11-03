import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'max2words',
    standalone: false
})
export class Max2WordsPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform(input: string) : string {
        let parts = input.split(" ");
        if (parts.length > 2) {
            return parts[0] + " " + parts[1] + " ...";
        } else {
            return input;
        }
    }
}