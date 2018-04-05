import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from './../../services/api-service.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Idle, DEFAULT_INTERRUPTSOURCES} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
   languages: any;
   langArray: any;
   langobj: Array<Object> = [];
   login: FormGroup;
   emailfieldVald: boolean;
   passwordField: boolean;
   keepmeloggedin: boolean;
   loginObj: any;
   // private formSubmitAttempt: boolean;
  emailRegex;
  password;
  isPasswordForgot: boolean;
  isPasswordCorrect: boolean;
  constructor(private formBuilder: FormBuilder, private router: Router,
           public restservice: ApiServiceService,private idle: Idle, private keepalive: Keepalive) {
            this.emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            this.password = null;
            // sets an idle timeout of 5 seconds, for testing purposes.
    idle.setIdle(172800);
    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    idle.setTimeout(172800);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => this.idleState = 'No longer idle.');
    idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      this.timedOut = true;
    });
    idle.onIdleStart.subscribe(() => this.idleState = 'You\'ve gone idle!');
    idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = 'You will time out in ' + countdown + ' seconds!' ;
      sessionStorage.clear();
    });
    keepalive.interval(2);
    keepalive.onPing.subscribe(() => this.lastPing = new Date());
    // sets the ping interval to 15 seconds
    this.reset();
      }

  ngOnInit() {
    if (sessionStorage.getItem('Token') !== null ) {
      this.router.navigate(['/my-account']);
    }
    this.createform();
    this.getlanguages();
    this.emailfieldVald = false;
    this.passwordField = false;
  }
   createform() {
    this.login = this.formBuilder.group({
      Username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern(this.emailRegex)]],
      Password: [this.password, [Validators.required]],
    });
   }

  onSubmit(value) {
    // this.formSubmitAttempt = true;
    // console.log(value.controls.Username);
     console.log(this.keepmeloggedin);
    if (value.controls.Username.valid === false) {
      this.restservice.customalert('' , 'Please enter Valid Email' ,
        'ok' , 'btn-red' , 'red');
    } else if (value.controls.Password.valid === false) {
      this.restservice.customalert('' , 'Please enter Password' ,
        'ok' , 'btn-red' , 'red');
    } else {
      this.passwordField = false;
      // console.log('form submitted');
      this.restservice.postCall('authorizeUser', value.value).subscribe(data => {
       console.log((<any>data)._body);
       this.loginObj =  JSON.parse((<any>data)._body);
       console.log(this.loginObj.token);
       sessionStorage.setItem('Token', this.loginObj.token);
       this.router.navigate(['/my-account']);
      }, err => {
        this.restservice.customalert('' , 'Invalid username/password, Please enter correct details' ,
        'Try Again' , 'btn-red' , 'red');
        this.login.reset();
    });
    }
   }

   getlanguages() {
     this.restservice.getCall('getLanguagesList').subscribe(data => {
      this.langobj = [];
       this.languages = JSON.parse((<any>data)._body);
       this.langArray = this.languages.Languages.Language ;
       // console.log(this.langArray);
       this.langArray.forEach(ele => {
         // console.log(ele.LanguageName);
         if (ele.LanguageName == 'English') {
          this.langobj.push({'LanguageName': ele.LanguageName, 'LanguageID': ele.LanguageID ,
         'langImg': './assets/image/demo/flags/gb.png'});
         } else if (ele.LanguageName == 'French'){
          this.langobj.push({'LanguageName': ele.LanguageName, 'LanguageID': ele.LanguageID ,
          'langImg': './assets/image/demo/flags/lb.png'});
         }
       });
      // console.log( this.langobj);

     });
   }

   reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;

  }
}
