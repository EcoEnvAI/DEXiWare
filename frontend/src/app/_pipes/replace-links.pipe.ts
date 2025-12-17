import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'replaceLinks',
    standalone: false
})
export class ReplaceLinksPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform(input: string) : SafeHtml {
        for (let link of this.getLinks(input)) {
            input = input.replace(link, '[<a href="' + link + '" target="_blank">link</a>]');
        }

        return this.sanitizer.bypassSecurityTrustHtml(input);
    }

    getLinks(input: string): string[] {
        let links = [];

        var regex = /http:\/\/|https:\/\//gi;
        var result;

        while (result = regex.exec(input)) {
            links.push(this.getLinkFromIdx(input, result.index));
        }

        return links;
    }

    getLinkFromIdx(input: string, idx: number): string {
        let partial = input.substring(idx);
        var regex = /\ /gi;
        let result = regex.exec(partial);
        if (result) {
            return partial.substring(0, result.index);
        } else {
            return partial;
        }
    }
}