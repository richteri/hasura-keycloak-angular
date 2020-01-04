import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-plant',
  templateUrl: './plant.component.html',
  styleUrls: ['./plant.component.css'],
})
export class PlantComponent implements OnInit, OnDestroy {

  plants: [];

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private apollo: Apollo) {
  }

  ngOnInit() {
    console.log('plant init');
    // emits on each poll and if obj is updated in global cache
    this.apollo.watchQuery<any>({
      query: gql`query getAllFactoriesQry {
        plant {
          id,
          name
        }
      }`,
      pollInterval: 2000,
    }).valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => this.plants = res.data.plant);
  }

  ngOnDestroy() {
    console.log('plant destroy');
    this.destroy$.next();
    this.destroy$.complete();
  }

}
