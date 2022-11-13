import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ToolbarModule} from "primeng/toolbar";
import {ButtonModule} from "primeng/button";
import {DialogModule} from 'primeng/dialog';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MessageService} from "primeng/api";
import {TableModule} from "primeng/table";
import {InputNumberModule} from "primeng/inputnumber";
import {AutoCompleteModule} from "primeng/autocomplete";
import {InputTextModule} from "primeng/inputtext";
import {CardModule} from "primeng/card";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    FormsModule,
    ReactiveFormsModule,
    MessageModule,
    MessagesModule,
    TableModule,
    InputNumberModule,
    AutoCompleteModule,
    InputTextModule,
    CardModule,
  ],
  providers: [
    MessageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
