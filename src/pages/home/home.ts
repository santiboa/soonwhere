import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	movies: Array<{title: string}>;
	theatre: any;
  constructor(public navCtrl: NavController, private geolocation: Geolocation, private http: HTTP) {
 	this.movies = [];
  	this.theatre = null;
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
  	let link = 'http://data.tmsapi.com/v1.1/movies/showings'
  	let params = {'api_key': 'dhq97fxeenhjbj58epy5zqqf', startDate: '2018-04-28', 'lat': coords.latitude+'', 'lng': coords.longitude+''}
  	console.log(params)

  	this.http.get(link, params, {})
	.then(data => {
		this.movies = JSON.parse(data.data);
		console.log(data.data)
	}, error => {
		console.log(error, this);
	});	
  }

  showMovie(movie){
  	let link = 'http://data.tmsapi.com/v1.1/theatres/' + movie.showtimes[0].theatre.id
  	console.log(link)
  	this.http.get(link, {'api_key': 'dhq97fxeenhjbj58epy5zqqf'}, {})
	.then(data => {
		this.theatre = JSON.parse(data.data);
		console.log(data.data)
	}, error => {
		console.log(error, this);
	});
  }

}
