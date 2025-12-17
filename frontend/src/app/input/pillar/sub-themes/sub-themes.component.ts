import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'true-sub-themes',
    templateUrl: './sub-themes.component.html',
    standalone: false
})
export class SubThemesComponent implements OnInit {
  @Input('theme') set theme(value) {
    this.themes = this.flattenThemes(value);
  };
  themes = [];

  constructor() { }

  flattenThemes(theme) {
    let themes = [];

    if (theme) {
      if (theme.parentTheme) {
        themes = this.flattenThemes(theme.parentTheme);
      }

      let prefix = new Array(themes.length).fill("sub").join("-");
      if (prefix != '') {
        prefix += '-';
      }

      themes.push({ name: prefix + "theme", description: {name: theme.description.name}});
    }
    return themes;
  }

  ngOnInit(): void {
    
  }
}
