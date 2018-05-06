import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	movies: any;
	showtimes: Array<{movie_id, cinema_id, start_at, movie, cinema, distance, time}>;
	cinemas: any;
	gps: any;
  constructor(public navCtrl: NavController, private geolocation: Geolocation, private http: HTTP) {
 	this.movies = {};
 	this.cinemas = {};
 	this.showtimes = []
  }
  
  getGPS(){
 	this.geolocation.getCurrentPosition().then((resp) => {
 		this.gps = resp.coords;
 		this.getMovies(resp.coords)
 	// resp.coords.latitude
 	// resp.coords.longitude
  	})
  }

  showPosition(x){
  	console.log(x, this);
  	this.getMovies(x)
  }

  checkTen(z) {
 	if (z < 10) {
		z = '0' + z;
 	}
 	return z;
 }

/**  checkHundreds(y) {
  	if ((y > 9) && (y < 99)){
  		y = '0' + y;
  	}
  	else if (y < 10) {
  		y = '00' + y;
  	}
  	return y;
  }
  **/

//UTC format for today
  timeStampToday() {
  	let now = new Date();
  	let month = now.getMonth() +1;
  	let day = now.getDate();
  	let hours = now.getHours();
  	let minutes = now.getMinutes();
  	let seconds = now.getSeconds();
// 	let millisecs = now.getMilliseconds();
  	let timeZones = (now.getTimezoneOffset() / 60 );
  	let monthString = this.checkTen(month);
  	let dayString = this.checkTen(day);
  	let hourString = this.checkTen(hours);
 	let minuteString = this.checkTen(minutes);
 	let secondString = this.checkTen(seconds);
// 	let millisecString = this.checkHundreds(millisecs);
  	let timeZoneString = this.checkTen(timeZones);
  	return (''+ now.getFullYear() + '-' + monthString + '-' + dayString + 'T'
  		+ hourString + ':' + minuteString + ':' + secondString + '-' + timeZoneString + ':00');
	// YYYY-MM-DDThh:mm:ss.sTZD
  }

//UTC format for tomorrow
  timeStampTomorrow() {
   	let now = new Date();
  	let month = now.getMonth() +1;
  	let day = now.getDate() +1; // Adds showtimes for tomorrow
  	let hours = now.getHours();
  	let minutes = now.getMinutes();
  	let seconds = now.getSeconds();
  	let timeZones = (now.getTimezoneOffset() / 60);
  	let monthString = this.checkTen(month);
  	let dayString = this.checkTen(day);
  	let hourString = this.checkTen(hours);
  	let secondString = this.checkTen(seconds);
 	let minuteString = this.checkTen(minutes);
  	let timeZoneString = this.checkTen(timeZones);
  	return (''+ now.getFullYear() + '-' + monthString + '-' + dayString + 'T'
  		+ hourString + ':' + minuteString + ':' + secondString + '-' + timeZoneString + ':00');
  }

//International Movie API call 
  getMovies(coords){
  	let link = 'https://api.internationalshowtimes.com/v4/showtimes'
  	let params = {'location': coords.latitude+','+coords.longitude+'', 
  	'time_from': this.timeStampToday(),
  	'time_to':  this.timeStampTomorrow(),	// format: '2018-05-06T08:00:00-08:00', 
  	'distance': '5',
	'movie_fields': 'id,title,poster_image_thumbnail,ratings', 'cinema_fields': 'id,name,location.lat,location.lon,location.address.display_text',
	'append': 'movies,cinemas'}

  	this.http.get(link, params, {"X-API-Key": '31nETRjAwSnfqH88Jiq4fBqwOayPyxcz'})
	.then(data => {
		let r = JSON.parse(data.data);
		console.log(data, r)

		for (let i of r.movies){
			this.movies[i.id] = i
		}
		for (let i of r.cinemas){
			this.cinemas[i.id] = i
		}
		console.log(this.movies, this.cinemas);
		//window.movies = this.movies;
		this.showtimes = r.showtimes;
		for (let s of this.showtimes){
			s.movie = this.movies[s.movie_id]
			s.cinema = this.cinemas[s.cinema_id]

			let pointb = {latitude: s.cinema.location.lat, longitude:  s.cinema.location.lon};
  			s.distance = this.getDistance(this.gps, pointb, "M");
  			s.time = this.formatTime(s.start_at);
		}
		console.log('all showtimes', this.showtimes)
		
		let cmp = function(a: any, b: any): number { 
			if (a.start_at < b.start_at) return -1;
			if (a.start_at > b.start_at) return 1;
			return 0;

		};
		this.showtimes = this.showtimes.sort(cmp);
	}, error => {
		console.log(error, this);
	});	
  }

//Formats response time to something useful
  formatTime(time){
  	let dt = new Date(time);
  	let now = new Date();
  	let hours = dt.getHours();
  	let nowHours = now.getHours();
  	let hoursDif = hours - nowHours;
  	let mins = dt.getMinutes();
  	let nowMin = now.getMinutes();
  	if (mins<nowMin) {
  		hoursDif = hoursDif-1;
  		mins = mins + 60;
  	}
  	let minsDif = mins - nowMin
  	mins = dt.getMinutes();
  	let m = 'AM'
  	if (hours > 12) { 
  		hours = hours - 12;
  		m = 'PM';
  	}
  	return (hours + ':' + this.checkTen(mins) + ' ' + m + ' (' + hoursDif + ' hr. and ' + minsDif + ' min. from now)');
  }

//Calculate distane between latitudes
	getDistance(pointa, pointb, unit) {
        let radlat1 = Math.PI * pointa.latitude/180;
        let radlat2 = Math.PI * pointb.latitude/180;
  //    let radlon1 = Math.PI * pointa.longitude/180;
  //    let radlon2 = Math.PI * pointb.longitude/180;
        let theta = pointa.longitude-pointb.longitude;
        let radtheta = Math.PI * theta/180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        dist = this.rounding(dist, 2);
        let unitString = unit;
        if (unit =='M') { 
        	unitString = ' miles'
        }
        if (unit=="K") { 
        	dist = dist * 1.609344;
        	unitString = ' kilometers';
        };
        if (unit=="N") { 
        	dist = dist * 0.8684;
        	unitString = ' nautical miles' 
        };
        return dist + unitString;
    // 'M' is statute miles (default)
		// 'K' is kilometers
		// 'N' is nautical miles
  }
  	rounding(num, places) {
  		let factor = Math.pow(10,places);
  		return Math.round(num * factor) / factor;
  	}
}


//Google API call key AIzaSyAqnYG5DSSBhYW_0hC9XLi918-k0aNOhBc
/**
  getTravel(coords){
    let link = 'https://maps.googleapis.com/maps/api/distancematrix/'
    let params = {'origins=': coords.latitude + ',' + coords.longitude + ''};

    this.http.get(link, params, {"X-API-Key": '31nETRjAwSnfqH88Jiq4fBqwOayPyxcz'})
  .then(data => {
    let r = JSON.parse(data.data);
    console.log(data, r)
    **/
    