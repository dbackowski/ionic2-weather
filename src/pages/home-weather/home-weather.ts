import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { ForecastServiceProvider } from '../../providers/forecast.service';
import { Forecast } from '../../interfaces/forecast';
import { LocationServiceProvider } from '../../providers/location.service';
import { Observable } from 'rxjs/Rx';
import { LoadingServiceProvider } from '../../providers/loading.service';
import { ToastServiceProvider } from '../../providers/toast.service';

@Component({
  selector: 'page-home-weather',
  templateUrl: 'home-weather.html',
})
export class HomeWeatherPage {
  public location: any;
  public skycons: any;
  public forecast: Forecast;
  public locationName: string;
  public bgColorClassName: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public geolocation: Geolocation,
    private forecastServiceProvider: ForecastServiceProvider,
    private locationServiceProvider: LocationServiceProvider,
    private toastServiceProvider: ToastServiceProvider,
    private loadingServiceProvider: LoadingServiceProvider
  ) {}

  ionViewDidLoad() {
    this.loadingServiceProvider.show();

    this.geolocation.getCurrentPosition().then((location) => {
      this.location = location;

      Observable.forkJoin(
        this.forecastServiceProvider.load(this.location.coords.latitude, this.location.coords.longitude),
        this.locationServiceProvider.load(this.location.coords.latitude, this.location.coords.longitude)
      ).finally(
        () => {
          this.loadingServiceProvider.hide();
        }
      ).subscribe(
        (resources) => {
          this.forecast = resources[0];
          this.locationName = resources[1].results[2].formatted_address;
          this.bgColorClassName = this.backgroundColorClassName();
        },
        (error) => {
          this.toastServiceProvider.error('Error occured during fetching data.')
        }
      );
    }).catch((error) => {
      this.loadingServiceProvider.hide();
      this.toastServiceProvider.error('Error occured during fetching current location.')
    });
  }

  private backgroundColorClassName(): string {
    let result;
    const tempMax = this.forecast.daily.data[0].temperatureMax;

    if (tempMax >= 30) {
      result = 'very-warm';
    }
    else if (tempMax >= 20 && tempMax < 30) {
      result = 'warm';
    }
    else if (tempMax > 10 && tempMax < 20) {
      result = 'normal';
    }
    else if (tempMax > 0 && tempMax < 10) {
      result = 'cold';
    }
    else if (tempMax <= 0) {
      result = 'very-cold';
    }

    return result;
  }
}
