import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

interface Message {
  name: string; message: string; type: string; sessionNumber: number;
}

interface MessageCount {
  messagecount: number; type: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  messages: Message[] = [];
  name!: string;
  message!: string;
  numberOfMessages = 0;
  numberOfSession = 0;
  ws!: WebSocketSubject<any>;
  message$!: Observable<Message>;
  messageNumber$!: Observable<MessageCount>;
  messageSubscription!: Subscription;
  messageNumberSubscription!: Subscription;

  connected!: boolean;

  constructor() { }

  ngOnInit() {
    this.connect();
  }

  ngOnDestroy(): void {
    this.disconnect()
  }

  connect() {
    // use wss:// instead of ws:// for a secure connection, e.g. in production
    this.ws = webSocket('ws://localhost:8081'); // returns a WebSocketSubject

    //  split the subject into 2 observables, depending on object.type
    this.message$ = this.ws.multiplex(
      // for Backend  我訂閱囉
      () => ({subscribe: 'message'}),
      // for Backend 我取消訂閱囉
      () => ({unsubscribe: 'message'}),
      // ?
      (message) => message.type === 'message'
    );

    this.messageNumber$ = this.ws.multiplex(
      () => ({ subscribe: 'messageNumber' }),
      () => ({ unsubscribe: 'messageNumber' }),
      (message) => message.type === 'messageNumber'
    );

    // subscribe to messages sent from the server
    this.messageSubscription = this.message$.subscribe(
      value =>{
        console.log(value)
        this.messages.push(value);
        this.numberOfSession = value.sessionNumber;
      },
      error =>{
        console.log(error);
        this.disconnect(error);
      },
      () => this.disconnect()
    );

    // get the number of the messages from the server
    this.messageNumberSubscription = this.messageNumber$.subscribe(
      // value =>{
      //   console.log('value',value)
      // }
      value => {
        console.log(value)
        this.numberOfMessages = value.messagecount;},
      error => this.disconnect(error),
      () => this.disconnect()
    );

    this.setConnected(true);
  }

  disconnect(err? :any) {
    if(this.connected){
      // if the connetion only have on content, then we can use complete() to disconnect
      // this.ws.complete();
      // but in this project, we have two content in the connection, so we use unsubscribe() to chose which one I want to disconnect.
      // unsubscribe() is a method from Subscription subject, so if we wnat to use it, we have to declare( on line 28 29)
      this.messageSubscription.unsubscribe();
      this.messageNumberSubscription.unsubscribe();
      this.setConnected(false);
    }else{
      if (err) { console.error(err); }
      this.setConnected(false);
      console.log('Disconnected');
    }
  }

  sendMessage() {
    this.ws.next({ name: this.name, message: this.message, type: 'message', sessionNumber: 0 });
    this.ws.next({ name: this.name, message: this.message, type: 'messageNumber', messagecount: 0 });
    this.message = '';
  }

  setConnected(connected? :any) {
    this.connected = connected;
    this.messages = [];
  }
}
