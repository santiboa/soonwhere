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
	showtimes: Array<{movie_id}>;
	cinemas: any;
  constructor(public navCtrl: NavController, private geolocation: Geolocation, private http: HTTP) {
 	this.movies = {};
 	this.cinemas = {};
 	this.showtimes = []
  }
  
  getGPS(){
 	this.geolocation.getCurrentPosition().then((resp) => {
 		this.getMovies(resp.coords)
 	// resp.coords.latitude
 	// resp.coords.longitude
  	})
  }

  showPosition(x){
  	console.log(x, this);
  	this.getMovies(x)
  }
  getMovies(coords){
  	let link = 'https://api.internationalshowtimes.com/v4/showtimes'
  	let params = {'location': coords.latitude+','+coords.longitude+'', 
  	'time_from': '2018-05-01T00:00:00-08:00', 
  	'time_to': '2018-05-02T00:00:00-08:00', 
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

	}, error => {
		console.log(error, this);
	});	
  }

  showMovie(movie){
  	let link = 'http://data.tmsapi.com/v1.1/theatres/' + movie.showtimes[0].theatre.id
  	console.log(link)
  	this.http.get(link, {'api_key': 'dhq97fxeenhjbj58epy5zqqf'}, {})
	.then(data => {
		let r = JSON.parse(data.data);
		console.log(data, r)
		this.showtimes = r.showtimes;
		for (let i of r.movies){
			this.movies[i.id] = i
		}
		for (let i of r.cinemas){
			this.cinemas[i.id] = i
		}
	}, error => {
		console.log(error, this);
	});
  }

}
