import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Canvg from "canvg";

@Component({
    selector: 'true-export',
    templateUrl: './export.component.html',
    styleUrls: ['./export.component.scss'],
    standalone: false
})
export class ExportComponent implements OnInit {
  public date;
  public isReady = false;
  public rendering = false;

  @ViewChild('content', { 'static': true }) content:ElementRef;
  @ViewChild('analysis', { 'static': true }) analysis:ElementRef;

  constructor(private dialogRef: MatDialogRef<ExportComponent>) { }

  ngOnInit(): void {
    this.date = new Date().toString();
  }

  ngAfterViewInit() {
    
  }

  ready() {
    this.isReady = true;
  }

  async download() {

    // true-node-chain svg 
    var chainDivElements = this.content.nativeElement.querySelectorAll('true-node-chain div');
    await chainDivElements.forEach(async function(item) {
      item.style.setProperty("position", "relative");
      item.style.setProperty("z-index", "1002");
    });

    var chainSvgElements = this.content.nativeElement.querySelectorAll('true-node-chain .bg-line');
    await chainSvgElements.forEach(async function(item) {
      item.style.setProperty('position', 'relative');
      item.style.setProperty('z-index', '1001');
    });

    //svg-icons
    var svgElements = this.content.nativeElement.querySelectorAll('svg-icon');
    await svgElements.forEach(async function(item) {
      //convert SVG into a XML string
      let svg = item.querySelector('svg');
      if (svg) {
        
        let xml = (new XMLSerializer()).serializeToString(svg);

        //draw the SVG onto a canvas
        let canvas = document.createElement("canvas");
        const ctx = canvas.getContext('2d');
        ctx.canvas.width = item.getBoundingClientRect().width;
        ctx.canvas.height = item.getBoundingClientRect().height;

        let v = await Canvg.fromString(ctx, xml);
        v.start();

        let imgData = canvas.toDataURL("image/png");
        let img = document.createElement('img');
        img.src = imgData;

        const keys = ["position", "top", "left"];
        Object.values(svg.style).map((key: string) => {
          if (keys.indexOf(key) >= 0) {
            img.style[key] = svg.style[key];
          }
        });

        item.parentNode.insertBefore(img, item);
        (item as HTMLElement).remove();
      }
    });

    svgElements = this.content.nativeElement.querySelectorAll('true-node-chain .bg-line');
    await svgElements.forEach(async function(item) {
      item.style.stroke = "#707070";
      item.style.top = "-76px";
      let xml = (new XMLSerializer()).serializeToString(item);

      //draw the SVG onto a canvas
      let canvas = document.createElement("canvas");
      const ctx = canvas.getContext('2d');
      ctx.canvas.width = item.getBoundingClientRect().width;
      ctx.canvas.height = item.getBoundingClientRect().height;

      let v = await Canvg.fromString(ctx, xml);
      v.start();

      let imgData = canvas.toDataURL("image/png");
      let img = document.createElement('img');
      img.src = imgData;

      const keys = ["position", "top", "left", "z-index"];
      
      Object.values(item.style).map((key: string) => {
        if (keys.indexOf(key) >= 0) {
          img.style[key] = item.style[key];
        }
      });
      
      item.parentNode.insertBefore(img, item);
      (item as HTMLElement).remove();
    });

    this.rendering = true;
    const div = document.getElementById('content');
    const options = {
      background: 'white',
      width: 1410,
      onclone: function (clonedDoc) {
        let button = clonedDoc.getElementById('bottomUpButton');
        if (button) button.style.display = 'none';
        button = clonedDoc.getElementById('topDownButton');
        if (button) button.style.display = 'none';
      }
    };

    html2canvas(div, options).then((canvas) => {
      var doc = new jsPDF('p', 'mm', 'a4');

      var pageWidth = 210;
      var pageHeight = 295;

      var position = 0;

      var paddingX = 5;
      var paddingY = 5;

      let canvasPageWidth = canvas.width;
      let canvasPageHeight = pageHeight * canvas.width / pageWidth;

      let subcanvas = document.createElement("canvas");
      let subcontext = subcanvas.getContext('2d');
      subcontext.canvas.width = canvasPageWidth;
      subcontext.canvas.height = canvasPageHeight;

      let headerHeight = this.analysis.nativeElement.getBoundingClientRect().top - this.content.nativeElement.getBoundingClientRect().top;
      if (headerHeight > canvasPageHeight) {
        // need to render some of the header on the next page
        let firstPageHeight = 1780;

        subcontext.drawImage(canvas, 0, 0, canvasPageWidth, firstPageHeight, 0, 0, canvasPageWidth, firstPageHeight);
        var imgData = subcanvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', paddingX,  paddingY, pageWidth - paddingX*2, pageHeight - paddingY*2);
        
        position = firstPageHeight
        
        let leftoverHeight = headerHeight - firstPageHeight;
        doc.addPage();
        subcontext.clearRect(0, 0, canvasPageWidth, canvasPageHeight);
        subcontext.drawImage(canvas, 0, position, canvasPageWidth, leftoverHeight, 0, 0, canvasPageWidth, leftoverHeight);
        imgData = subcanvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', paddingX,  paddingY, pageWidth - paddingX*2, pageHeight - paddingY*2);

        position += leftoverHeight;
      } else {
        subcontext.drawImage(canvas, 0, 0, canvasPageWidth, canvasPageHeight, 0, 0, canvasPageWidth, canvasPageHeight);
        var imgData = subcanvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', paddingX,  paddingY, pageWidth - paddingX*2, pageHeight - paddingY*2);
        
        position = canvasPageHeight
      }
      
      while (position < canvas.height) {
        doc.addPage();
        subcontext.clearRect(0, 0, canvasPageWidth, canvasPageHeight);
        subcontext.drawImage(canvas, 0, position, canvasPageWidth, canvasPageHeight, 0, 0, canvasPageWidth, canvasPageHeight);
        imgData = subcanvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', paddingX,  paddingY, pageWidth - paddingX*2, pageHeight - paddingY*2);
        position += canvasPageHeight - (paddingY * 0.5 * canvas.width / pageWidth);
      }
      return doc;
    }).then((doc) => {
      doc.save('export.pdf');
      this.dialogRef.close();  
    });
  }
}
