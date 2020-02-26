import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { Base64ToGallery, Base64ToGalleryOptions } from '@ionic-native/base64-to-gallery/ngx'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  @ViewChild('imageCanvas', {static: false}) canvas: any;
  canvasElement: any;
  saveX: number;
  saveY: number;
  
  selectedColor = '#9e2956';

  colors = [ '#9e2956', '#c2281d', '#de722f', '#edbf4c', '#5db37e', '#459cde', '#4250ad', '#802fa3' ];
  
  drawing = false;
  lineWidth = 5;

  constructor(private plt: Platform, private base64ToGallery: Base64ToGallery, private toastCtrl: ToastController) {}
  
  ngAfterViewInit(): void {
    // Set the Canvas Element and its size
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width() + '';
    this.canvasElement.height = this.plt.height() *  0.7;
  }

  startDrawing(ev) {
    this.drawing = true;
    var canvasPosition = this.canvasElement.getBoundingClientRect();

    this.saveX = ev.pageX - canvasPosition.x;
    this.saveY = ev.pageY - canvasPosition.y;
  }

  endDrawing() {
    this.drawing = false;
  }

  selectColor(color) {
    this.selectedColor = color;
  }

  setBackground() {
    var background = new Image();
    background.src = './assets/test-image.png';
    let ctx = this.canvasElement.getContext('2d');

    background.onload = () => {
      this.canvasElement = this.canvas.nativeElement;
      this.canvasElement.width = background.width;
      this.canvasElement.height = background.height;

      ctx.drawImage(background,0,0, this.canvasElement.width, this.canvasElement.height);
      this.drawRectangle(732, 342, 68, 39, this.lineWidth, '#EE6352', -5);
      this.drawRectangle(732, 422, 68, 39, this.lineWidth, '#EE6352');
      this.drawRectangle(730, 517, 68, 39, this.lineWidth, '#EE6352');
      this.drawRectangle(812, 336, 136, 49, this.lineWidth, '#FAC05E');
      this.drawRectangle(814, 421, 139, 52, this.lineWidth, '#FAC05E');
      this.drawRectangle(815, 518, 142, 54, this.lineWidth, '#FAC05E');
    }
  }

  drawRectangle(x, y, width, height, lineWidth, color, degrees: number=0) {
    let ctx = this.canvasElement.getContext('2d');
    
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    // save the untranslated/unrotated context first
    ctx.save();

    ctx.beginPath();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(degrees * Math.PI / 180);
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    
    // restore the context to its untranslated/unrotated state
    ctx.restore();
  }

  moved(ev) {
    if (!this.drawing) return;

    var canvasPosition = this.canvasElement.getBoundingClientRect();
    let ctx = this.canvasElement.getContext('2d');

    let currentX = 0;
    let currentY = 0;
    if (this.plt.is('desktop')) {
      currentX = ev.pageX - canvasPosition.x;
      currentY = ev.pageY - canvasPosition.y;
    }
    else {
      currentX = ev.touches[0].pageX - canvasPosition.x;
      currentY = ev.touches[0].pageY - canvasPosition.y;
    }
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.selectedColor;
    ctx.lineWidth = this.lineWidth;

    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();

    ctx.stroke();

    this.saveX = currentX;
    this.saveY = currentY;
  }

  exportCanvasImage() {
    var dataUrl = this.canvasElement.toDataURL();

    // Clear the current canvas
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (this.plt.is('cordova')) {
      const options: Base64ToGalleryOptions = { prefix: 'canvas_', mediaScanner: true };

      this.base64ToGallery.base64ToGallery(dataUrl, options).then(
        async res => {
          const toast = await this.toastCtrl.create({
            message: 'Image saved to camera roll.',
            duration: 2000
          });
          toast.present();
        },
        err => console.log('Error saving image to gallery ', err)
      );
    } else {
      // Fallback for Desktop
      var data = dataUrl.split(',')[1];
      let blob = this.b64toBlob(data, 'image/png');

      var a = window.document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'canvasimage.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
}
