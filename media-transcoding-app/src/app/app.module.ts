import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';


import { MatButtonModule, MatSelectModule, MatInputModule, MatToolbarModule, MatIconModule, MatProgressBarModule } from '@angular/material';
import { AppComponent } from './app.component';
import { MediaManipulationComponent } from './media-manipulation/media-manipulation.component';
import { MediaManipulationService } from './media-manipulation.service';

@NgModule({
  declarations: [
    AppComponent,
    MediaManipulationComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule, MatSelectModule, MatInputModule, MatToolbarModule, MatIconModule, MatProgressBarModule
  ],
  providers: [MediaManipulationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
