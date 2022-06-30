import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  private map:any;
  mapMarker: any;
  markers: any;
  countStandAvailable: number = 0;
  MedStandAvailable:any
  countStationDispo: number = 0;
  electricBikes: number =0;
  bikesTotal: number = 0;

  private initMap(): void {

    this.map = L.map('map', {
      center: [ this.mapMarker[1].position.latitude, this.mapMarker[1].position.longitude ],
      zoom: 14
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    this.markers = new L.LayerGroup().addTo(this.map);
    this.addMarker();
    tiles.addTo(this.map);

  }

  ngAfterViewInit(): void {
      setInterval(() => {
        this.http.get('https://api.jcdecaux.com/vls/v3/stations?contract=marseille&apiKey=0d959233d2522aac14eab96780889fcac110b39e').subscribe(
          data => {
            if (this.markers){
              this.markers.clearLayers();
            }
            this.mapMarker = data;
            this.markers = new L.LayerGroup().addTo(this.map);
            this.addMarker();
            },
          error => console.error('There was an error!', error)
      )
      }, 10000);
  }

  ngOnInit(){
    this.http.get('https://api.jcdecaux.com/vls/v3/stations?contract=marseille&apiKey=0d959233d2522aac14eab96780889fcac110b39e').subscribe(
          data => {

            this.mapMarker = data;
            console.log(this.mapMarker[2].totalStands.availabilities.stands);
            this.countStandAvailable = 0
            this.electricBikes = 0
            this.bikesTotal = 0
            this.mapMarker.forEach((elm:any) => {
              this.countStandAvailable += elm.totalStands.availabilities.stands;
              this.electricBikes += elm.totalStands.availabilities.electricBikes;
              this.bikesTotal += elm.totalStands.availabilities.bikes;
              // console.log(elm.totalStands.availabilities.stands);
            });
            console.log(this.mapMarker);
            // console.log(Math.round(this.countStandAvailable / this.mapMarker.length) )
            this.MedStandAvailable = Math.round(this.countStandAvailable / this.mapMarker.length)
            this.initMap();},
          error => console.error('There was an error!', error)
      )
  }


  title = 'angularMap';

  constructor(private http: HttpClient) { }

  addMarker() {
    const myIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.2.0/images/marker-icon.png'
    });
    this.countStationDispo = 0
    this.mapMarker.forEach((elm:any) => {

      if(elm.totalStands.availabilities.stands >= 1) {
        this.countStationDispo += 1
        L.marker([elm.position.latitude, elm.position.longitude], {icon: myIcon}).bindPopup(elm.name + ' stand dispo : '+elm.totalStands.availabilities.stands).addTo(this.markers)
      }
    });
  }

}
